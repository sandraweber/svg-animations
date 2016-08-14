FROM ubuntu
ENV VIRTUAL_HOST svg.websome.ch
ENV NODE_ENV docker
VOLUME ["/var/svg-animations"]

#Install NodeJS
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:chris-lea/node.js
RUN echo "deb http://us.archive.ubuntu.com/ubuntu/ precise universe" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y nodejs 


#svg-animations
WORKDIR /var/svg-animations

CMD bash -C '/var/svg-animations/docker/startup.sh'

