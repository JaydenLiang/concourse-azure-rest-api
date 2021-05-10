FROM node:14-alpine
# ENV NODE_ENV=production
RUN apk add --no-cache git
RUN mkdir -p /home/concourse
WORKDIR /home/concourse
COPY ["./", "./"]
RUN npm install --silent && npm run make-dist && rm -rf node_modules
RUN cp -R scripts/ /opt/resource/
RUN cp -R dist/bin/ /opt/bin/
RUN cp -R params/ /opt/params/
RUN chmod +x /opt/resource/*
