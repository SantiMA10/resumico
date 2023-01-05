FROM nvidia/cuda:12.0.0-devel-ubuntu22.04

# Create and change to the app directory.
WORKDIR /usr/src/app

# Install dependencies
RUN apt update && apt upgrade -y
RUN apt install -y curl git
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs
RUN npm --global install yarn
RUN apt install ffmpeg -y
RUN apt install python3 python3-pip -y
RUN pip3 install git+https://github.com/openai/whisper.git 

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND yarn.lock are copied.
# Copying this separately prevents re-running yarn install on every code change.
COPY package.json ./
COPY yarn.lock ./

# Install production dependencies.
RUN yarn --frozen-lockfile

# Copy local code to the container image.
COPY . ./

# Build the project
RUN yarn build

ENV NODE_ENV="production"

# Run the web service on container startup.
CMD [ "yarn", "run", "start:o11y" ]