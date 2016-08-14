docker stop svg-app
docker rm svg-app
docker run -d -v ~/svg-animations/:/var/svg-animations -p 80 --name=svg-app svg /bin/bash -c /var/svg-animations/docker/startup.sh

