<p align="center">
   <img src="./.github/resumico.svg">
   <p align="center">
      <a href="#requirements">🧰 Requirements</a> -
      <a href="#configuration">🛠️ Configuration</a> - 
      <a href="#deploy">🚀 Deploy</a> - 
      <a href="#license">⚖️ License</a> - 
      <a href="./README.md">🌍 Español</a>
   </p>
   <p align="center">
      A WhatApp bot to transcribe and summarize audio messages.
   </p>
</p>

# Requirements

You will need:
- NodeJS >= 16
- WhatsApp API token.
- OpenAI API token.
- (optional) If you want to use "Google Cloud Speech to Text":
  - A Google Cloud Storage bucket, to store temporally files.
  - ffmpeg installed to transform audios to a format accepted by the service.
- (optional) If you want to use "whisper", you only need to have it install.
- (optional) If you want to use a task queue, the project is compatible with Google Cloud Tasks.

# Configuration

Copy the `.env.example` file as `.env` or add the following env vars in your environment.

```text
OPEN_AI_GPT3_TOKEN="" // OpenAI token.

WHATSAPP_TOKEN="" // WhatsApp sender token.
WHATSAPP_API_VERSION="v15.0"
WHATSAPP_SENDER="" // the phone that will send the messages.
WHATSAPP_VERIFY_TOKEN="" // a random token to verify your webhook with WhatsApp.

FILE_DOWNLOAD_PATH="/tmp" // The folder in which the temporal files are going to be stored.

GCLOUD_BUCKET="" // Your Google Cloud Storage Bucket.
GCLOUD_TASK_QUEUE="" // You queue from Google Cloud Task.
GCLOUD_LOCATION="" // Your Google Cloud Task region.
GCLOUD_TASK_MODE="" // A value between "appengine" (if you use AppEngine in Google Cloud Tasks) or "http" if you use other service.
GCLOUD_PROJECT="" // Your Google Cloud project name.

TASK_URL="" // The URL of your service. Example: https://tu-servicio.com/tasks
TASK_SERVICE="" // A value between "google" (if you want to use Google Cloud Tasks) or "http" (if you don't want a task service).

SPEECH_TO_TEXT_SERVICE="" // A value between "google" (if you want to use Google Cloud Speech to Text) or "whisper" (if you want to use whisper).
```

# Deploy

```
yarn install
yarn build // to build ts into js
yarn start // to start the server
```

# Contributing

Thank you for considering contributing to the DevOps for Stream Deck. Feel free to send in any pull requests.

# Support the project

If you like the project, you can subscribe to my [Twitch channel](https://www.twitch.tv/santima10), where I do live coding of this and other projects.

# License

This project is under the [CC-BY-NC-4.0](./LICENSE) license.