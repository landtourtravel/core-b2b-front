// ==========================================
// 2. NÚCLEO: DESTINOS Y SERVICIOS
// ==========================================
model Destino {
  id          Int           @id @default(autoincrement())
  pais        String
  ciudad      String
  hoteles     Hotel[]
  actividades Actividad[]
  traslados   Traslado[]
}

model Hotel {
  id          Int       @id @default(autoincrement())
  destinoId   Int
  nombre      String
  estrellas   Int       @default(3)
  
  destino     Destino   @relation(fields: [destinoId], references: [id], onDelete: Cascade)
  
  tarifas           TarifaHotel[]
  politicasNinos    PoliticaNinos[]
  paquetes          PaqueteHotel[]
}

model Actividad {
  id          Int       @id @default(autoincrement())
  destinoId   Int
  nombre      String
  descripcion String?   @db.Text
  
  destino     Destino   @relation(fields:[destinoId], references: [id], onDelete: Cascade)
  tarifas     TarifaActividad[]
  paquetes    PaqueteActividad[]
}

model Traslado {
  id          Int       @id @default(autoincrement())
  destinoId   Int
  tipo        String    // Ej: 'Aeropuerto-Hotel'
  
  destino     Destino   @relation(fields: [destinoId], references: [id], onDelete: Cascade)
  tarifas     TarifaTraslado[]
  paquetes    PaqueteTraslado[]
}

// ==========================================
// 3. TARIFAS (CENTRALIZADAS)
// ==========================================
model TarifaHotel {
  id                   Int    @id @default(autoincrement())
  hotelId              Int
  tipoHabitacion       String // 'SGL', 'DBL', 'TPL', 'QUAD', 'CHD'
  precioBase           Float
  precioNocheAdicional Float
  hotel Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)
}

model PoliticaNinos {
  id          Int    @id @default(autoincrement())
  hotelId     Int
  rangoNombre String // Ej: 'Infante 0-2', 'Child 3-11'
  edadMin     Int
  edadMax     Int
  hotel       Hotel  @relation(fields: [hotelId], references: [id], onDelete: Cascade)
}

model TarifaActividad {
  id          Int       @id @default(autoincrement())
  actividadId Int
  tipoTarifa  String    // Ej: 'ADULTO', 'NINO', 'GENERAL'
  precio      Float
  actividad   Actividad @relation(fields: [actividadId], references: [id], onDelete: Cascade)
}

model TarifaTraslado {
  id          Int       @id @default(autoincrement())
  trasladoId  Int
  tipoCobro   String    // Ej: 'POR_PERSONA', 'POR_VEHICULO'
  precio      Float
  traslado    Traslado  @relation(fields: [trasladoId], references: [id], onDelete: Cascade)
}

// ==========================================
// 4. PAQUETES PRE-CREADOS (SNAPSHOTS)
// ==========================================
model Paquete {
  id              Int       @id @default(autoincrement())
  nombre          String
  descripcion     String?   @db.Text
  incluyeBoleto   Boolean   @default(false)
  diasEstancia    Int
  nochesBase      Int
  
  // Snapshot de Precios Finales
  precioSGL       Float?
  precioDBL       Float?
  precioTPL       Float?
  precioQUAD      Float?
  precioCHD       Float?
  
  hoteles         PaqueteHotel[]
  actividades     PaqueteActividad[]
  traslados       PaqueteTraslado[]
  imagenes        ImagenPaquete[]
}

model ImagenPaquete {
  id        Int     @id @default(autoincrement())
  paqueteId Int
  url       String
  orden     Int     @default(0)
  paquete   Paquete @relation(fields: [paqueteId], references: [id], onDelete: Cascade)
}

// Tablas de Relación (Junction Tables)
model PaqueteHotel {
  paqueteId Int
  hotelId   Int
  paquete   Paquete @relation(fields:[paqueteId], references: [id], onDelete: Cascade)
  hotel     Hotel   @relation(fields:[hotelId], references: [id], onDelete: Cascade)
  @@id([paqueteId, hotelId])
}

model PaqueteActividad {
  paqueteId   Int
  actividadId Int
  paquete     Paquete   @relation(fields: [paqueteId], references: [id], onDelete: Cascade)
  actividad   Actividad @relation(fields: [actividadId], references: [id], onDelete: Cascade)
  @@id([paqueteId, actividadId])
}

model PaqueteTraslado {
  paqueteId  Int
  trasladoId Int
  paquete    Paquete  @relation(fields:[paqueteId], references: [id], onDelete: Cascade)
  traslado   Traslado @relation(fields: [trasladoId], references: [id], onDelete: Cascade)
  @@id([paqueteId, trasladoId])
}