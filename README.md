# InPlusCore - Sistema de Gestión de Leads para WhatsApp

## 📱 Descripción
InPlusCore es una aplicación web moderna que integra WhatsApp Web con un sistema de gestión de leads, permitiendo el seguimiento y automatización de conversaciones con pacientes. La aplicación utiliza tecnologías modernas como React, Next.js, TypeScript y WebSocket para proporcionar actualizaciones en tiempo real.

## 🚀 Características Principales

- **Integración con WhatsApp Web**
  - Conexión automática mediante QR Code
  - Estado de conexión en tiempo real
  - Manejo robusto de reconexiones

- **Gestión de Leads**
  - Seguimiento de conversaciones en tiempo real
  - Información detallada de pacientes
  - Estado de citas y departamentos
  - Activación/desactivación de bot por lead

- **Interfaz de Usuario**
  - Diseño responsive y moderno
  - Actualizaciones en tiempo real
  - Indicadores visuales de estado
  - Dashboard con estadísticas

## 🛠️ Tecnologías Utilizadas

- **Frontend**
  - Next.js 13+ (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - Zustand (Estado global)
  - Socket.io-client

- **Backend**
  - Node.js
  - Express
  - Socket.io
  - WhatsApp Web.js
  - Sequelize (ORM)

## 📦 Requisitos Previos

- Node.js 18.x o superior
- npm o yarn
- Base de datos compatible con Sequelize
- Navegador moderno con soporte para WebSocket

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/inpluscore.git
   cd inpluscore
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con tus configuraciones

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

## 🏗️ Estructura del Proyecto

```
inpluscore/
├── src/
│   ├── app/              # Rutas y páginas de Next.js
│   ├── components/       # Componentes React reutilizables
│   ├── store/           # Estado global con Zustand
│   ├── types/           # Definiciones de TypeScript
│   └── utils/           # Utilidades y helpers
├── public/              # Archivos estáticos
└── package.json         # Dependencias y scripts
```

## 🔄 Estado Global

El estado de la aplicación se maneja con Zustand y incluye:

- Estado de conexión de WhatsApp
- Lista de leads y sus estados
- Estadísticas en tiempo real
- Estado de carga y errores

## 🌐 WebSocket Events

### Cliente → Servidor
- `update-bot-status`: Actualiza el estado del bot para un lead
- `ping`: Mantiene la conexión activa

### Servidor → Cliente
- `whatsappStatus`: Estado de conexión de WhatsApp
- `leads-data`: Actualizaciones de leads
- `stats-data`: Estadísticas actualizadas

## 🔍 Debugging

La aplicación incluye herramientas de debugging:

- Redux DevTools para Zustand
- Logs detallados en consola
- Monitoreo de eventos WebSocket

## 📊 Modelos de Datos

### Lead
```typescript
interface Lead {
  id: string;
  phone: string;
  conversationState?: {
    patientInfo?: {
      name: string;
      department: string;
    };
    appointmentInfo?: {
      location: string;
      date: string;
      time: string;
    };
  };
  botState?: {
    is_bot_active: boolean;
  };
  created_at: string;
  updated_at: string;
}
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Trabajo Inicial* - [TuUsuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- WhatsApp Web.js por proporcionar la biblioteca base
- La comunidad de Next.js y React
- Todos los contribuidores que han participado en este proyecto

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en el repositorio.

---
⌨️ con ❤️ por [Tu Nombre](https://github.com/tu-usuario)
