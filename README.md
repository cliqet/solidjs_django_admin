### Intro
This project is an SPA built from SolidJS and is used as the user interface for the [custom_django_admin](https://github.com/cliqet/custom_django_admin). Think of this as Django admin's templates but made with a frontend framework for a more flexible customization. 

### Prerequisites
- Node 20.18.1
- SolidJS 1.9.3
- Tailwind 3.4.16
- Typescript 5.7.2

### Before starting
There are some custom pages here that were made to work with the demo mode 
of the backend and you will need to remove this once you start your own project. 
- `src.pages.CustomCountryProfileChangePage`
- `src.components.extra_inlines.SampleExtraInline`
The rest is up to you to modify according to your needs. By default, this should 
work without any modifications and everything should update with changes to the 
admin backend.

### Setting up the application in your local environment 
1. Make sure you have a `config.toml` file in the root directory and populate the values. Refer to 
`config.example.toml` for more information.
2. Run
```bash
npm install
```
then 
```bash
npm run start
```

### Integrations
The login form is protected using Cloudflare turnstile so you need to 
have an account and setup your turnstile widget.

### Run with Docker
In the root directory, run
```bash
./devops/prod/deploy_prod.sh
```
Modify the directories according to your environments. 

### Screenshots
#### Login
<img width="1382" alt="login" src="https://github.com/user-attachments/assets/45e0a0a3-94a5-4319-a487-fdb8abf1bbbe" />

#### App Search
<img width="1404" alt="app_search" src="https://github.com/user-attachments/assets/c8bfbf68-0476-438f-b91d-6142164d0c17" />

#### Forms
<img width="1395" alt="add_form1" src="https://github.com/user-attachments/assets/fbf9dadc-96e4-4126-8dcb-773c809d7ab5" />
<img width="1395" alt="add_form2" src="https://github.com/user-attachments/assets/2ec7c3e4-f604-4cc8-bf9f-7e55c1f6ad0c" />

### Inlines
<img width="1395" alt="inlines" src="https://github.com/user-attachments/assets/ed429279-5e55-40cf-bc9a-cc3fe6b8e3d2" />

#### Listview
<img width="1395" alt="listview1" src="https://github.com/user-attachments/assets/ab0e9071-2057-45bd-9473-9ef39cdd48ef" />
<img width="1395" alt="listview2" src="https://github.com/user-attachments/assets/8035ca39-8e83-451e-a2d4-5f8b35610b20" />

#### Documentation 
<img width="1395" alt="docs" src="https://github.com/user-attachments/assets/abaad498-0a1a-4535-b6b5-07b9b2a21b4f" />

### Queue Management
<img width="1395" alt="queue_management" src="https://github.com/user-attachments/assets/01faa26c-1b9d-4bc4-ac25-778d371b8151" />

### Query Builder Reports
<img width="1396" alt="query_builder" src="https://github.com/user-attachments/assets/33c0ed54-5368-4214-8d85-93941d28833d" />

### Raw SQL Query Reports
<img width="1372" alt="raw_query" src="https://github.com/user-attachments/assets/708f0569-8169-4e55-beda-c91b0b2ea796" />

### Lightmode
<img width="1405" alt="lightmode" src="https://github.com/user-attachments/assets/438bda14-ef8b-4eaa-80bd-fe5c9ebcf467" />

### Mobile
<img width="328" alt="mobile" src="https://github.com/user-attachments/assets/0408f42f-8cf3-46f1-a4ac-e14060c92f19" />


