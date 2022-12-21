FROM node:18-bullseye

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package.json ./
COPY yarn.lock ./

# Install production dependencies.
RUN yarn --frozen-lockfile
RUN apt update && apt upgrade -y
RUN apt install ffmpeg -y
RUN apt install python3 python3-pip -y
RUN pip3 install git+https://github.com/openai/whisper.git 

# Copy local code to the container image.
COPY . ./

# Build the project
RUN yarn build

ENV NODE_ENV="production"

# Run the web service on container startup.
CMD [ "yarn", "run", "start" ]