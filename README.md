# Static Site Translation Service (SSTS)

****

## Table of Contents
1. [Introduction](#introduction)
2. [Restrictions](#restrictions)
3. [Features](#features)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Build](#build)
7. [Conclusion](#conclusion)
8. [License](#license)

****

## Introduction

This project is designed to create a system for translating static websites, consisting of HTML pages, resources, and scripts organized within a directory structure. The system enables the automatic replacement of all text node values to translate the site into different languages. Translators can log in with a username and password and perform translations directly in the HTML pages. This approach simplifies the translation process, making it more convenient and efficient, while also enhancing the quality of the translated content.

****

## Restrictions

1. **File naming:** HTML files must be named using Latin letters without spaces.
2. **Support search tools:** This program is originally designed for use with [github.com/squidfunk/mkdocs-material](https://github.com/squidfunk/mkdocs-material), so it supports search tools specifically for mkdocs-material. However, if search functionality is not your key feature, you can still use this program to translate your site. 

****

## Features

### Admin Features

1. **Add New Project:** Admins can create and add new projects for translation, defining the structure and initial settings.
2. **Monitor Translation Progress:** Admins have access to a dashboard where they can view the current state of translation for each project, including the number of untranslated text nodes on each page.
3. **Delete Project:** Admins can remove existing projects from the system, including all associated translation data.
4. **Manage Translators:** Admins can assign or reassign translators to specific projects, managing who has access to translate which content.
5. **Export Translation Results:** Admins can export the completed translations for deployment or further processing.
6. **Translate Content:** Admins have the ability to perform translations directly, with the same tools available to translators.

### Translator Features
1. **Translate Content:** Translators can access projects they are assigned to and translate the content directly in the HTML pages.
2. **Monitor Translation Progress:** Translators can track the progress of their work by viewing the number of untranslated text nodes on each page, helping them prioritize their efforts.

****

## Installation

1. **Clone the repository:**
 ```bash
  git clone https://github.com/mlysanov/SSTS
  cd SSTS
  ```
   
2. **Create file config.json and fill it with credentials of admin. Specify the path to this file in application.properties**
  ```bash
    [
      {
        "login": "paste login of your admin here",
        "password": "paste password of your admin here",
        "role": "admin"
      }
    ]
   ```

3 **Create empty file projects.json. Specify the path to this file in application.properties**

4 **Fill in the application.properties file (visit [Configuration](#configuration))**

****

## Build

1. **Build backend**
  ```bash
  cd apps/ssts-backend
  mvn clean package
  ```
2. **Build frontend**
  ```bash
  cd apps/ssts-frontend
  npm run build
  ```

3. **Copy directories target (were created with building backend) and build (were created with building frontend), config.json and projects.json to your server**

4. **Configure nginx**
  ```bash
  server {
    listen 80;
    server_name pasteYourIPOrDomen;

    return 301 https://$host$request_uri;
    client_max_body_size 10000M;
  }

  server {
      server_name pasteYourIPOrDomen;
  
      location / {
          root /home/app/frontend;
          index index.html;
          try_files $uri $uri/ /index.html;
      }
  
      location /api/ {
          proxy_pass http://localhost:8080;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
      
      client_max_body_size 10000M;
  }
  ```

## Configuration

### 1. application.properties

- `spring.application.name: [name of this project]`
- `projects.directory: [path to your directory that will contains projects (sites for translate)]`
    - Replace with your path
- `config.json: [path to your file that will contains user credentials]`
    - Replace with your path
- `projects.json: [path to your file that will contains infrormation about projects]`
    - Replace with your path
- `spring.servlet.multipart.max-file-size: [this parameter defines the maximum allowed size of a single uploaded file]`
    - Replace with your value
- `spring.servlet.multipart.max-request-size: [this parameter defines the maximum allowed size of the entire multipart request]`
    - Replace with your value

****

## Conclusion

This project is open-source, and contributions are welcome. If you have ideas for improvements or want to add new features, feel free to fork the repository for implementation. And you are welcome to send bug reports.

****

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

