# Usa la imagen base de Jenkins
FROM jenkins/jenkins:lts

# Mantainer del contenedor
LABEL maintainer="developer@developia.io"

# Usuario root para poder instalar paquetes
USER root

# Actualiza los repositorios e instala Apache, PHP y utilidades necesarias
RUN apt-get update && \
    apt-get install -y apache2 php libapache2-mod-php php-cli php-xml unzip wget && \
    apt-get clean

# Descargar e instalar phpDocumentor
RUN wget https://github.com/phpDocumentor/phpDocumentor/releases/latest/download/phpDocumentor.phar -O /usr/local/bin/phpdoc && \
    chmod +x /usr/local/bin/phpdoc

# Exponer el puerto 80 para Apache y el puerto 8080 para Jenkins
EXPOSE 80 8080

# Configurar Apache para iniciarse junto con Jenkins
CMD service apache2 start && exec /usr/local/bin/jenkins.sh

