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
<img width="1335" alt="login_page" src="https://github.com/user-attachments/assets/225a4225-cbac-45de-bcdd-28d82391c93c" />

#### Forms
<img width="1335" alt="add_form" src="https://github.com/user-attachments/assets/f36bca66-e6bd-4873-a13c-4331106ea7e4" />

### Inlines
<img width="1376" alt="inlines" src="https://github.com/user-attachments/assets/a3bcac9b-752a-49d5-939d-b0d8aa123604" />

### Change Inline row
<img width="1376" alt="change_inline" src="https://github.com/user-attachments/assets/58b8fed7-c3e0-4f6a-8eee-2c38b72b9c29" />

#### Listview
<img width="1376" alt="listview1" src="https://github.com/user-attachments/assets/70a8a45c-3834-4729-a9a3-ddd6ad5e3ebf" />
<img width="1376" alt="listview2" src="https://github.com/user-attachments/assets/d0e56849-51aa-452c-82e1-5a14acb8b275" />

#### Documentation 
<img width="1335" alt="doc_page" src="https://github.com/user-attachments/assets/2a1fd52a-6ea3-4c52-b58a-0434f5826e11" />

### Queue Management
<img width="1350" alt="Screenshot 2025-02-14 at 2 34 46 PM" src="https://github.com/user-attachments/assets/6b4f3471-faf0-4a65-a479-add2261885c8" />

### Query Builder Reports
<img width="1350" alt="Screenshot 2025-02-14 at 2 25 39 PM" src="https://github.com/user-attachments/assets/f6f173a3-a6ed-4963-96a7-e8aa2dbf47e2" />

### Raw SQL Query Reports
<img width="1350" alt="Screenshot 2025-02-14 at 2 26 09 PM" src="https://github.com/user-attachments/assets/252cfb7b-562a-4d09-826f-ad02b2d21d78" />

### Lightmode
<img width="1376" alt="lightmode" src="https://github.com/user-attachments/assets/b6224e77-eb7e-4693-8ec5-77f8157834c9" />

### Mobile
<img width="323" alt="mobile" src="https://github.com/user-attachments/assets/56740b2c-cbd0-4217-9012-0d07d3750c62" />



