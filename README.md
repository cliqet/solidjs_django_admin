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
<img width="1333" alt="Screenshot 2025-01-27 at 12 26 57 PM" src="https://github.com/user-attachments/assets/49d07907-33cc-41ad-a8c4-5045773536f5" />

#### Forms
<img width="1345" alt="Screenshot 2025-01-27 at 12 45 07 PM" src="https://github.com/user-attachments/assets/2660fc55-60c6-4da9-a66a-e3b93bc278f6" />

#### Listview
<img width="1350" alt="Screenshot 2025-02-14 at 2 35 33 PM" src="https://github.com/user-attachments/assets/3cae7690-64e2-400b-b9ec-2c3c35afc6d2" />
<img width="1350" alt="Screenshot 2025-02-14 at 2 35 49 PM" src="https://github.com/user-attachments/assets/1ca28d66-b293-45cf-add9-e019b4dd13c8" />

#### Documentation 
<img width="1350" alt="Screenshot 2025-02-14 at 2 35 03 PM" src="https://github.com/user-attachments/assets/523fec9a-f0ab-40bb-b2c8-4b52ada58817" />

### Queue Management
<img width="1350" alt="Screenshot 2025-02-14 at 2 34 46 PM" src="https://github.com/user-attachments/assets/6b4f3471-faf0-4a65-a479-add2261885c8" />

### Query Builder Reports
<img width="1350" alt="Screenshot 2025-02-14 at 2 25 39 PM" src="https://github.com/user-attachments/assets/f6f173a3-a6ed-4963-96a7-e8aa2dbf47e2" />

### Raw SQL Query Reports
<img width="1350" alt="Screenshot 2025-02-14 at 2 26 09 PM" src="https://github.com/user-attachments/assets/252cfb7b-562a-4d09-826f-ad02b2d21d78" />




