<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Especificación de Requerimientos (SRS) - Land Tour</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 40px; 
            background-color: #f4f4f4;
        }
        .container { 
            max-width: 900px; 
            margin: auto; 
            background-color: #fff;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            overflow: hidden;
            margin-bottom: 40px;
        }
        .header { 
            background-color: #000;
            color: #fff; 
            padding: 40px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 5px solid #e2007a;
        }
        .logo { 
            max-width: 220px; 
            height: auto;
        }
        .doc-title { 
            text-align: right; 
        }
        .doc-title h1 { 
            margin: 0; 
            color: #e2007a; 
            font-size: 22px; 
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .doc-title p {
            margin: 5px 0 0 0;
            font-size: 0.9em;
            color: #ccc;
        }
        .content-body {
            padding: 40px;
        }
        h1, h2 {
            color: #e2007a;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-top: 30px;
            font-size: 20px;
            text-transform: uppercase;
        }
        h3 {
            color: #333;
            font-size: 17px;
            margin-top: 25px;
            border-left: 4px solid #e2007a;
            padding-left: 10px;
        }
        p, li {
            font-size: 15px;
            text-align: justify;
            margin-bottom: 10px;
        }
        ul {
            padding-left: 20px;
            margin-bottom: 20px;
        }
        .image-container {
            margin: 25px 0;
            text-align: center;
        }
        .image-container img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border: 1px solid #ddd;
        }
        .placeholder-box {
            background-color: #f9f9f9;
            border: 2px dashed #e2007a;
            color: #e2007a;
            padding: 40px;
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
            border-radius: 10px;
            text-transform: uppercase;
            font-size: 13px;
        }
        .detail-box {
            background-color: #fafafa;
            padding: 20px;
            border-left: 4px solid #e2007a;
            margin-bottom: 30px;
            border-radius: 0 10px 10px 0;
        }
        .detail-box h3 {
            margin-top: 0;
            margin-bottom: 15px;
            border-bottom: 2px solid #eee;
            padding-bottom: 5px;
            color: #e2007a;
            font-size: 16px;
            border-left: none;
            padding-left: 0;
        }
        .detail-box p {
            margin: 0;
            margin-bottom: 5px;
            font-size: 14px;
        }
        .highlight-box {
            background-color: #fdf2f8;
            padding: 20px;
            border-left: 4px solid #e2007a;
            margin: 30px 0;
            border-radius: 0 10px 10px 0;
        }
        .signature-container {
            margin-top: 80px;
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
        }
        .signature {
            text-align: center;
            width: 250px;
            border-top: 1px solid #333;
            padding-top: 10px;
            font-size: 14px;
            font-weight: bold;
        }
        .footer-note {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999;
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/logo/2.png" alt="Easy Store Logo" class="logo">
            <div class="doc-title">
                <h1>SRS - Documentación Completa</h1>
                <p><strong>Proyecto:</strong> Plataforma B2B Land Tour</p>
                <p><strong>Desarrollado por:</strong> Easy Store</p>
            </div>
        </div>

        <div class="content-body">
            
            <div class="detail-box">
                <h3>CLIENTE</h3>
                <p><strong>Lt Tours SAS</strong></p>
                <p><strong>RUC:</strong> 0993387686001</p>
                <p><strong>Dir:</strong> Victor Manuel Rendón 600 y Escobedo</p>
                <p><strong>Email:</strong> lttourskg@hotmail.com</p>
                <p><strong>Concepto:</strong> Desarrollo Plataforma B2B</p>
            </div>

            <h1>1. Visión General</h1>
            <p>La aplicación es una plataforma web B2B para una agencia de viajes mayorista, diseñada para automatizar y optimizar la venta de paquetes turísticos a agencias minoristas (sus clientes). El sistema permitirá a las agencias minoristas cotizar paquetes prearmados o personalizados, agregar sus propias comisiones y generar documentos de venta (PDF) con marca blanca para entregárselos al pasajero final, así como administrar usuarios internos, aliados y permitir la creacion de liquidaciones en base a las cotizaciones recibidas desde las agencias minoristas. La plataforma estará constituida por dos aplicaciones monorepo App 1: Panel de agencias y cotizador App 2: Panel admin/colaboradores y liquidaciones.</p>

            <h1>2. Arquitectura de Información</h1>
            <p>Basado en las necesidades del cliente, la plataforma se dividirá en las siguientes secciones principales:</p>

            <h3>Sitio Público (Front-end Publicitario):</h3>
            <ul>
                <li><strong>Landing page:</strong> orden acordado: Hero -> Seccion de paquetes -> Seccion de destinos -> catálogo de destinos -> Carrusel de tarjetas -> Seccion captación de Agencias -> Seccion de comentarios -> Seccion contactanos -> Seccion de Suscripcion -> Footer (Final); Debe contener funcionalidad para redireccion a paquetes, vista tipo modal de destinos y previsualización tipo modal de detalle de paquetes. Propuesta seleccionada: land-tour-sample/index.html</li>
                <li><strong>Vista modal de paquetes:</strong> Galería multimedia (imágenes) y botón de "Contacto a Agencias". Resumen, itinerario, incluye y cotizar con llamado a la acción para contactar agencias via whatsapp o cotizar via mail. Propuestas de diseño escogidas: vista-modal-paquetes con el seccionado de diseño3</li>
                <li><strong>Vista modal de destinos generales:</strong> con detalle de destinos turísticos, galería de imágenes, conteo de paquetes y llamado a la acción para revisar paquetes disponibles para el destino seleccionado.</li>
                <li><strong>Pagina de paquetes:</strong> vista general de paquetes disponibles con herramienta de buscador, filtros personalizados por precio, destino y días. Buscador por nombre incluido en titulo / destino de paquetes pre creados, mostrados por coincidencia de caracteres. Paquetes clickeables y redireccionables a vista modal de detalle de paquetes.</li>
            </ul>

            <h3>Portal B2B (Acceso Privado):</h3>
            <p>Pantalla de Login para agencias aliadas.</p>

            <h3>Módulo de Cotización (Cotizador):</h3>
            <ul>
                <li>Sección de Programas Armados (Paquetes pre-creados).</li>
                <li>Dashboard</li>
                <li>Sección de Programas Personalizados (Arma tu viaje).</li>
                <li>Listado de cotizaciones</li>
                <li>Sección lista de paquetes / buscador</li>
            </ul>

            <h3>Detalle de Cotización:</h3>
            <p>Desglose de hotel, traslados, excursiones, vuelos (opcional) y valor extra adicional (a criterio de la minorista).</p>

            <h3>Módulo de Exportación:</h3>
            <p>Vista previa de la cotización y generador de documentos pre-cotizacion y cotización (PDF).</p>

            <h3>Panel Super Admin (Back-office) (POR DEFINIR):</h3>
            <p>Gestión de agencias, gestión de inventario (hoteles, tours, traslados), gestión de tarifas por temporadas y liquidaciones.</p>

            <h1>3. Requerimientos Funcionales</h1>
            
            <h3>Para el Usuario Público (Pasajero Final):</h3>
            <ul>
                <li>DEBE poder visualizar la información gráfica de los destinos y paquetes.</li>
                <li>DEBE tener un botón de "Contactar agencias / Cotizar" que despliegue un directorio de agencias minoristas aliadas (por ciudad) a las cuales contactar, ya que la plataforma no vende al consumidor final.</li>
                <li>NO DEBE tener la opción de registrarse ni de reservar en la plataforma.</li>
            </ul>

            <h3>Para el Usuario Agencia Minorista (Aliado B2B):</h3>
            <ul>
                <li>DEBE poder iniciar sesión con credenciales provistas por el Super Admin.</li>
                <li>DEBE poder seleccionar un destino, fechas y configuración de pasajeros (adultos, niños, tipo de habitación: SGL, DBL, TPL).</li>
                <li>DEBE poder agregar el costo de los boletos aéreos de forma manual (valor dinámico) para que se sume al total del paquete.</li>
                <li>DEBE poder inyectar un markup o comisión extra (ej. sumar $20 o $50 al total) antes de generar el documento final.</li>
                <li>DEBE poder generar y descargar la cotización/pre-cotizacion en formato PDF, donde aparezca su propio logotipo (y no el de la mayorista).</li>
                <li>Se acordó proporcionar un Dashboard con resumen y contador de cotizaiones realizadas y sus estados.</li>
                <li>DEBE tener un modulo para visualizar y buscar entre los paquetes pre-creados.</li>
                <li>DEBE poder crear paquetes personalizados desde cero con los valores y datos contenidos en la base de datos, permitiendo la posibilidad de crear también paquetes personalizados multidestino.</li>
                <li>DEBE permitir modificar paquetes pre-creados en cualquiera de sus características trayendo los datos disponibles para paquetes personalizados y aplicar estos valores en el paquete en cuestión, así como añadir destinos adicionales.</li>
                <li>NO DEBE permitir disminuir los valores pre determinados de los paquetes pre-creados (a excepción del boleto).</li>
                <li>NO DEBE permitir modificar paquetes que han sido determinados como no-modificables por el super admin.</li>
            </ul>

            <h3>Para el Super Administrador (Agencia Mayorista) (POR DEFINIR):</h3>
            <ul>
                <li>DEBE tener control total (CRUD) sobre la creación, edición y eliminación de cuentas de agencias minoristas.</li>
                <li>DEBE poder cargar y gestionar el inventario de servicios: destinos, hoteles, traslados, excursiones/actividades y paquetes armados.</li>
                <li>DEBE poder configurar matrices de precios basadas en hotel, tipo de habitación, cantidad de pasajeros, cantidad de infantes, actividades, traslados, destinos agregados y tiempo de estadía.</li>
                <li>DEBE tener un submódulo de "Liquidación" para aprobar y procesar las ventas concretadas por las agencias.</li>
                <li>DEBE tener un dashboard con KPI’s y resumen de cotizaciones/pre-cotizaciones y liquidaciones, así mismo como un apartado de log de acciones/actividades recientes.</li>
                <li>DEBE permitir visualizar reportes de Ventas por Destino.</li>
            </ul>

            <h1>4. Funcionalidades Críticas</h1>
            <ul>
                <li><strong>Cotizador Matemático Dinámico:</strong> Es indispensable que el sistema calcule automáticamente los totales exactos dependiendo de la cantidad de noches, tipo de habitación y número de personas, reduciendo un proceso manual de 20 minutos a unos pocos clics.</li>
                <li><strong>Exportación en "Marca Blanca" (White-label):</strong> Vital para el negocio. La agencia minorista debe poder imprimir el itinerario y la cotización con su propia identidad visual (logo y datos de contacto) en un formato PDF.</li>
                <li><strong>Manejo de Tarifas Fijas vs. Dinámicas:</strong> El sistema debe mezclar los precios estáticos (cargados en la base de datos para hoteles y tours) con ingresos dinámicos manuales (como el precio del vuelo que el agente ingresa en el momento).</li>
            </ul>

            <h1>5. Restricciones Técnicas</h1>
            <ul>
                <li><strong>Arquitectura de Software:</strong> Se acordó separar el proyecto en un Frontend/Cotizador (portal agencias para la web pública) y un Backend/Panel Administrativo (posiblemente alojado en un subdominio) por temas de seguridad y organización.</li>
                <li><strong>Integraciones de Terceros (APIs):</strong> Por presupuesto y alcance inicial (Fase 1), el cliente solicitó NO integrarse mediante APIs a proveedores como Booking, Expedia o aerolíneas. Toda la base de datos de hoteles, precios y disponibilidad será propia y alimentada manualmente por el Super Admin. La integración mediante APIs queda relegada a una posible actualización futura.</li>
                <li><strong>Gestión de Base de Datos:</strong> Se requiere diseñar una base de datos relacional robusta que soportes múltiples variables de precios (Sencilla, Doble, Triple, Niños, Días de la semana, Feriados).</li>
            </ul>

            <h1>6. Notas de UI/UX</h1>
            <ul>
                <li><strong>Sitio Público Visual:</strong> La web debe ser muy llamativa, con fuerte enfoque en contenido multimedia (imágenes grandes) para "vender" la experiencia del destino al pasajero que navega.</li>
                <li><strong>Cotizador Intuitivo (Flujo de 3 a 4 clics):</strong> La interfaz privada para las agencias debe ser un formulario por pasos muy ágil. Seleccionar destino -> Ingresar fechas -> Seleccionar pasajeros/habitación -> Agregar vuelo/comisión -> Imprimir.</li>
                <li><strong>Prevención de Errores UX:</strong> Se debe ocultar opciones que rompan la lógica de negocio (ej. Si el usuario busca 2 noches, no se deben mostrar hoteles que exigen un mínimo de 3 noches por contrato).</li>
                <li><strong>Diseño responsive:</strong> Se debe garantizar la adaptación del diseño visual a todas las pantallas priorizando la vista móvil y su correcto funcionamiento.</li>
                <li><strong>Identidad:</strong> Se aplicarán logos y colores proporcionados por el cliente garantizando mantener congruencia con la identidad visual de la marca.</li>
            </ul>

            <h1>7. Arquitectura de Datos</h1>
            <p>Se adjunta modelo de entidades:</p>
                        <h3><a href="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/Modelos+E-R-LTT.pdf" style="text-decoration: underline; color: #e2007a;">Enlace modelos E/R</a></h3>


            <h1>Referencias Visuales</h1>
            <p>Propuesta de diseño Landing page seleccionada: land-tour-sample/index.html</p>
            <p>Landing page orden:</p>
            
            <h3>Hero (cambiar foto de fondo por una playa):</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/hero.png" alt="Hero Section">
            </div>

            <h3>Seccion de paquetes (aplicar tarjeta del ejemplo2):</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/seccion+de+paquetes.png" alt="Sección de Paquetes">
            </div>

            <h3>Ejemplo 2:</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/ejemplo2.png" alt="Ejemplo 2">
            </div>

            <h3>Seccion de destinos:</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/seccion+de+destinos.png" alt="Sección de Destinos">
            </div>

            <h3>Carrusel de tarjetas:</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/carrusel+de+tarjetas.png" alt="Carrusel de Tarjetas">
            </div>

            <h3>Seccion captación de agencias (cambiar botón de acceso por regístrate):</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/seccion+captacion+de+agencias.png" alt="Captación de Agencias">
            </div>

            <h3>Sección de comentarios:</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/seccion+de+comentarios.png" alt="Sección de Comentarios">
            </div>

            <h3>Sección contáctanos (a la izquierda, dejar solo correo y dirección guayaquil ecuador):</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/seccion+contactanos.png" alt="Sección Contáctanos">
            </div>

            <h3>Sección suscríbete:</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/seccion+suscribete.png" alt="Sección Suscríbete">
            </div>

            <h3>Footer (cambiar youtube por tiktok y quitar el botón de soporte de agencias):</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/footer.png" alt="Footer">
            </div>

            <h3>Diseño modal - detalle de paquetes:</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/dise%C3%B1o+modal+detalle+de+paquetes.png" alt="Diseño Modal 1">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/modal+detalle+de+pquetes+2.png" alt="Diseño Modal 2">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/modal+detalle+de+paquetes+3.png" alt="Diseño Modal 3">
            </div>

            <h3>Propuesta de diseño panel de cotización:</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/propuesta+panel+de+cotizacion.png" alt="Panel de Cotización">
            </div>

            <h3>Propuesta de diseño Panel Admin:</h3>
            <div class="image-container">
                <img src="https://easy-store-ecu-files.s3.us-east-2.amazonaws.com/Proposals/Recursos+proyectos/ltt/propuesta+panel+admin.png" alt="Panel Admin">
            </div>

            <h1>8. Cronograma del Proyecto</h1>
            <ul>
                <li><strong>Inicio:</strong> Martes, 28 de abril de 2026</li>
                <li><strong>Half project (30 días hábiles):</strong> Miércoles, 10 de junio de 2026</li>
                <li><strong>Entrega Final del Proyecto (60 días hábiles):</strong> Miércoles, 22 de julio de 2026</li>
            </ul>

            <div class="highlight-box">
                <p><strong>CLÁUSULA DE ALCANCE:</strong> Cualquier funcionalidad no listada explícitamente en este documento (ej. integración con APIs de terceros o módulo de liquidación detallada) será tratada como una Solicitud de Cambio (Change Request) y cotizada por separado.</p>
            </div>
            
            <div class="signature-container">
                <div class="signature">
                    Easy Store<br>
                    Desarrollo y Diseño
                </div>
                <div class="signature">
                    Lt Tours SAS<br>
                    Cliente
                </div>
            </div>

        </div>

        <div class="footer-note">
            Este documento es propiedad intelectual de Easy Store. 2026.
        </div>
    </div>
</body>
</html>