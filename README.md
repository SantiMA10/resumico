# 🤖 audio2summary

> A WhatApp bot to transcribe and summarize audio messages.

# Setup

## WhatsApp

1. Create a [business Meta App](https://developers.facebook.com/apps/create/).
2. Then click on "Add products" and choose WhatsApp.
3. In the WhatApp section:
   1. Configure your webhook endpoint.
      1. Add the verification token in the `WHATSAPP_VERIFY_TOKEN` env var.
      2. In webhook fields choose `messages`.
   2. On start using the API section
      1. You can find your test phone, that phone should go in the `WHATSAPP_SENDER` env var.
4. In the App Roles/Roles section, click on "Edit roles in Business Manager".
5. In the "Business Manager":
   1. Go to Users/System users
   2. Add a new one with "System User Role" set to "Admin" (be careful since you can only have one admin user)
   3. In the user:
      1. Click in "Add asset", select your app and enable all the option including the ones in the "Full control section"
      2. Click in "Generate new token", copy the token and paste it into `WHATSAPP_TOKEN` env var.

## Google Cloud

As today, the project is designed to be deployed on GCP since it makes use of several of its services.

## App Engine Standard

We use the nodejs environment in [App Engine Standard](https://cloud.google.com/appengine/docs/standard/nodejs/runtime) since it has a great free tier (26 hours) and ffmpeg installed.

### Speech to Text

We use it to transcribe the audio files. 

In order to make it work you need:

1. The [Speech to Text api](https://console.cloud.google.com/marketplace/product/google/speech.googleapis.com) enabled.
2. A service account with access to the Speech to Text api in the a file with the path set in `GOOGLE_APPLICATION_CREDENTIALS`. [More information](https://cloud.google.com/docs/authentication/application-default-credentials#GAC)

### Storage bucket

To store the files and that the Speech to Text api can read them.

In order to make it work you need:

1. A GCS bucket, you need to set the name in the `GCLOUD_BUCKET` env var.
2. A service account with access to the bucket.

### Tasks

To handle the requests to the audio2summary endpoint, since we need to respond as fast as we can to WhatApp's webhook.

1. A Google Cloud Tasks queue, configure to run task to your App Engine service.
   1. Add the queue name, location and project in the following env vars: `GCLOUD_TASK_QUEUE`, `GCLOUD_LOCATION` and `GCLOUD_PROJECT`.
2. A service account with access to the Google Cloud Tasks queue.

## OpenAI GPT-3 token

1. Visit the [OpenAI](https://openai.com/api/) website.
2. Log in/Sign up.
3. Visit the [API keys](https://beta.openai.com/account/api-keys) section.
4. Create a new secret key.
5. Past the key in the `.env` as `OPEN_AI_GPT3_TOKEN`.

# License

This project is under the [CC-BY-NC-4.0](./LICENSE) license.