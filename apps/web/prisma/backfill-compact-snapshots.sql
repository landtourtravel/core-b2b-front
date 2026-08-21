-- ============================================================================
-- Backfill único: compacta los snapshots JSON de la tabla "Cotizacion" al
-- formato actual. Ejecutar UNA sola vez (es idempotente: re-ejecutarlo no
-- cambia nada). Ejecutar en el SQL Editor de Supabase o vía psql.
--
-- Contexto: las filas creadas antes del commit 13cc795 congelaban `detalle`
-- (descripciones largas) dentro de snapshotIncluyeDestinos y no guardaban los
-- `id` de actividades/traslados. El formato actual congela solo {id, nombre}
-- y resuelve `detalle` en vivo (attachLiveActividadDetalle).
-- ============================================================================

begin;

-- 1) snapshotIncluyeDestinos: elimina `detalle` congelado y rellena `id`
--    faltante por match de nombre contra el catálogo (best-effort; si no hay
--    match el item conserva solo `nombre`, igual que el fallback de lectura).
update "Cotizacion" c
set "snapshotIncluyeDestinos" =
  (select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
      'destinoId', g->'destinoId',
      'destinoCiudad', g->'destinoCiudad',
      'actividades', coalesce((
        select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'id', coalesce(case when jsonb_typeof(a)='object' then a->'id' end,
                 to_jsonb((select min(act.id) from "Actividad" act
                   where act.nombre = (case when jsonb_typeof(a)='string' then a #>> '{}' else a->>'nombre' end)
                     and to_jsonb(act."destinoId") = g->'destinoId'))),
          'nombre', case when jsonb_typeof(a)='string' then a else a->'nombre' end
        )) order by aord)
        from jsonb_array_elements(g->'actividades') with ordinality as ax(a, aord)), '[]'::jsonb),
      'traslados', coalesce((
        select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'id', coalesce(case when jsonb_typeof(t)='object' then t->'id' end,
                 to_jsonb((select min(tr.id) from "Traslado" tr
                   where tr.tipo = (case when jsonb_typeof(t)='string' then t #>> '{}' else t->>'nombre' end)
                     and to_jsonb(tr."destinoId") = g->'destinoId'))),
          'nombre', case when jsonb_typeof(t)='string' then t else t->'nombre' end
        )) order by tord)
        from jsonb_array_elements(g->'traslados') with ordinality as tx(t, tord)), '[]'::jsonb)
    )) order by gord)
   from jsonb_array_elements(c."snapshotIncluyeDestinos") with ordinality as gx(g, gord))
where c."snapshotIncluyeDestinos" is not null
  and jsonb_typeof(c."snapshotIncluyeDestinos") = 'array';

-- 2) Estados finales: wizardState ya no se usa (solo sirve para reeditar
--    BORRADORes; handleEditCot aborta en cualquier otro estado).
update "Cotizacion"
set "wizardState" = null
where status in ('APROBADA', 'RECHAZADA', 'LIQUIDADA')
  and "wizardState" is not null;

-- 3) Aprobadas/liquidadas con hoteles ya seleccionados: podar
--    hotelsComparisonSnapshot a los elegidos, rehidratando destinoCiudad y
--    destinoPais en los sobrevivientes (dedupeDestinoLabels los dejó solo en
--    la primera aparición de cada destinoId, que puede no ser un elegido).
update "Cotizacion" c
set "hotelsComparisonSnapshot" =
  (select jsonb_agg(
     h
     || jsonb_strip_nulls(jsonb_build_object(
          'destinoCiudad', coalesce(h->'destinoCiudad',
            (select f->'destinoCiudad' from jsonb_array_elements(c."hotelsComparisonSnapshot") f
              where f->'destinoId' = h->'destinoId' and f ? 'destinoCiudad' limit 1)),
          'destinoPais', coalesce(h->'destinoPais',
            (select f->'destinoPais' from jsonb_array_elements(c."hotelsComparisonSnapshot") f
              where f->'destinoId' = h->'destinoId' and f ? 'destinoPais' limit 1))))
     || jsonb_build_object('selected', true)
     order by ord)
   from jsonb_array_elements(c."hotelsComparisonSnapshot") with ordinality as hx(h, ord)
   where h->'selected' = 'true'::jsonb)
where c.status in ('APROBADA', 'LIQUIDADA')
  and jsonb_path_exists(c."hotelsComparisonSnapshot", '$[*] ? (@.selected == true)');

commit;

-- Control de tamaños (antes/después):
-- select pg_size_pretty(sum(pg_column_size("snapshotIncluyeDestinos"))::bigint) as snap,
--        pg_size_pretty(sum(pg_column_size("wizardState"))::bigint) as wizard,
--        pg_size_pretty(sum(pg_column_size("hotelsComparisonSnapshot"))::bigint) as hoteles
-- from "Cotizacion";
