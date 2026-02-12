

# Plan: Crear Archivo HTML de Documentacion de Diseno UI/UX

## Objetivo
Generar un archivo HTML estatico que documente visualmente todo el analisis de diseno realizado sobre el panel de filtros, permitiendo visualizarlo en el navegador.

## Archivo a Crear

**Ubicacion:** `src/docs/filter-design-specs.html`

## Contenido del Archivo

### 1. Seccion de Paleta de Colores
- Cuadros de color con codigos hex
- Colores primarios: Turquesa (#17C3B2), Azul secundario (#4DA3D0)
- Colores neutros: Grises para texto, bordes y fondos
- Estados interactivos: hover, focus, disabled

### 2. Seccion de Tipografia
- Familia: Sans-serif (Inter/Roboto)
- Jerarquia de tamanos: Titulos (16-18px), Labels (12-14px), Texto (14px)
- Pesos: Regular (400), Medium (500), Semibold (600)
- Colores de texto: Principal (#333), Secundario (#666), Placeholder (#999)

### 3. Seccion de Componentes UI

#### Inputs de Texto
- Altura: 44-48px
- Border-radius: 8px
- Borde: 1px solid #E0E0E0
- Estilo floating label
- Estados: normal, focus, filled

#### Selectores/Dropdowns
- Mismo estilo que inputs
- Icono chevron a la derecha
- Opciones con hover state

#### Botones
- Primario: Fondo turquesa, texto blanco, altura 48px
- Secundario: Fondo blanco, borde gris, texto oscuro
- Link: Texto azul sin fondo
- Border-radius: 8px

#### Tags/Pills de Caracteristicas
- Border-radius: 16-20px (pill shape)
- Padding: 8px 16px
- Estados: no seleccionado (borde gris), seleccionado (fondo turquesa)

### 4. Seccion de Layout y Espaciado
- Padding del contenedor: 16-20px
- Espacio entre secciones: 20-24px
- Espacio entre label e input: 8px
- Grid de 2 columnas para inputs de rango

### 5. Seccion de Estructura del Filtro
Diagrama visual mostrando:
```text
+----------------------------------+
|  Filtros          Limpiar todo   |
+----------------------------------+
|  Ubicacion                       |
|  [Ciudad ▼] [Municipio ▼]        |
+----------------------------------+
|  Tipo de Inmueble                |
|  [Habitacional][Comercial]       |
|  [Industrial][Otros]             |
+----------------------------------+
|  Rango de precio                 |
|  [$ Min] - [$ Max]               |
+----------------------------------+
|  Superficie                      |
|  [m2 Min] - [m2 Max]             |
+----------------------------------+
|  Recamaras    [1][2][3][4][5+]   |
+----------------------------------+
|  Banos        [1][2][3][4][5+]   |
+----------------------------------+
|  Caracteristicas                 |
|  (Amueblado)(Pet Friendly)       |
|  (Estacionamiento)(Jardin)       |
+----------------------------------+
|  [Cancelar]  [Aplicar Filtros]   |
+----------------------------------+
```

## Especificaciones Tecnicas del HTML

### Estructura
- HTML5 semantico con estilos inline para portabilidad
- Sin dependencias externas
- Responsive para visualizacion en diferentes dispositivos

### Secciones
1. Header con titulo del documento
2. Grid de colores interactivo
3. Showcase de tipografia
4. Galeria de componentes con estados
5. Diagrama de estructura
6. Notas de implementacion

## Resultado Esperado
Un archivo HTML autocontenido que sirva como guia de referencia visual para implementar los cambios en el panel de filtros, mostrando exactamente como deben verse cada uno de los elementos segun el analisis realizado.

