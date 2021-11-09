FROM       ubuntu:bionic

#-- Mise à jour du système d’exploitation --#

RUN        apt-get update
RUN        apt-get upgrade -y

#-- Installation d’outils --#

RUN        apt-get install -y sudo curl nano git bash wget gnupg software-properties-common

#-- Réglage du fuseau horaire

RUN        sudo ln -fs /usr/share/zoneinfo/Europe/Paris /etc/localtime
RUN        sudo apt-get install -y tzdata

#-- MongoDB --#

RUN        wget -qO - https://www.mongodb.org/static/pgp/server-4.0.asc | sudo apt-key add -
RUN        sudo add-apt-repository  "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse"
RUN        sudo apt-get update
RUN        sudo apt-get install -y mongodb-org

#-- Installation de l’application --#

RUN        sudo useradd mobitweet --create-home --shell /bin/bash

USER       mobitweet
RUN        curl "https://install.meteor.com/?release=1.6.1.1" | sh
USER       root
RUN        cp "/home/mobitweet/.meteor/packages/meteor-tool/1.6.1_1/mt-os.linux.x86_64/scripts/admin/launch-meteor" /usr/bin/meteor

USER       mobitweet
RUN        mkdir -p /home/mobitweet/app/store
RUN        mkdir -p /home/mobitweet/app/public
COPY       --chown=mobitweet:mobitweet app/ /home/mobitweet/app/
WORKDIR    /home/mobitweet/app/public
RUN        wget -O public.tar.gz https://www.dropbox.com/s/g7957z23w4c8qrh/public.tar.gz?dl=1
RUN        tar xzf public.tar.gz
RUN        rm public.tar.gz
WORKDIR    /home/mobitweet/app/data
RUN        wget -O data.tar.gz https://www.dropbox.com/s/tcy24p8q81a3wdl/data.tar.gz?dl=1
RUN        tar xzf data.tar.gz
RUN        rm data.tar.gz
WORKDIR    /home/mobitweet/app
RUN        mv icons/*.png public/icons
RUN        rm -fR icons

RUN        meteor npm install

#-- Lancement des services --#

EXPOSE     3000
ENTRYPOINT bash start.sh
