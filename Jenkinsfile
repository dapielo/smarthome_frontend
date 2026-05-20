pipeline {
    agent any

    environment {
        APACHE_ROOT = '/var/www/html'
    }

    stages {
        stage('Deploy to Apache') {
            steps {
                script {
                    // Copia los archivos del repositorio a la carpeta de Apache
                    sh "cp -r * ${APACHE_ROOT}"
                }
            }
        }


    }

    post {
        success {
            echo 'Deployment generation successful.'
        }
        failure {
            echo 'Deployment generation failed.'
        }
    }
}

