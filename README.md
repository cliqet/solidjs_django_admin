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