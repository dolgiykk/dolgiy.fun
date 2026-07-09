FROM node:22-alpine

RUN apk add --no-cache \
    git \
    bash \
    nano \
    vim

WORKDIR /app

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]