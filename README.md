<p align="center">
   <img src="./.github/resumico.svg">
   <p align="center">
      <a href="#requisitos">🛠️ Requisitos</a> -
      <a href="#configuracion">🚀 Configuración</a> - 
      <a href="#licencia">⚖️ Licencia</a> - 
      <a href="./README.en.md">🌍 English</a>
   </p>
   <p align="center">
      Un bot de WhatsApp que te permite transcribir y resumir audios.
   </p>
</p>

# Requisitos

Para hacer funcionar el bot necesitaras:
- API token para enviar mensajes en WhatsApp.
- API token para GPT-3 de OpenAI.
- (opcional) Si quieres usar "Google Cloud Speech to Text":
  - Un bucket de Google Cloud Storage para subir los ficheros.
  - ffmpeg instalado para podertransformar los audios a un formato acceptado por el servicio.
- (opcional) Si quieres usar "whisper" tenerlo instalado y cumplir los requisitos.
- (opcional) Si quieres usar una cola para evitar saturar el ordenador con las conversiones, una cola en Google Cloud Task.

# Configuración

Copia el fichero `.env.example` a `.env` o añade como prefieras las siguientes variables de entorno para que sean accesibles.

```text
OPEN_AI_GPT3_TOKEN="" // token de OpenAI

WHATSAPP_TOKEN="" // token para enviar mensajes desde la API de WhatsApp
WHATSAPP_API_VERSION="v15.0"
WHATSAPP_SENDER="" // número de telefono desde el que se van a enviar los mensajes
WHATSAPP_VERIFY_TOKEN="" // token para verificar el webhook durante la configuración

FILE_DOWNLOAD_PATH="/tmp" // lugar donde se descargan los audios de forma temporal

GCLOUD_BUCKET="" // nombre del bucket en Google Cloud
GCLOUD_TASK_QUEUE="" // nombre de la cola en Google Cloud Task
GCLOUD_TASK_URL="" // URL a la que Google Cloud Task tiene que enviar las task. Ejemplo: https://tu-servicio.com/tasks
GCLOUD_LOCATION="" // Region en la que se encuenta Google Cloud Task
GCLOUD_TASK_MODE="" // Un valor entre "appengine" (si utilizas AppEngine) o "http" si usas otros servicios
GCLOUD_PROJECT="" // Nombre de tu proyecto de Google Cloud

SPEECH_TO_TEXT_SERVICE="" // Un valor entre "google" (si usas Google Cloud Speech to Text) o "whisper" (si quieres usar whisper)
```

# Licencia

Este proyecto se publica bajo licencia: [CC-BY-NC-4.0](./LICENSE).