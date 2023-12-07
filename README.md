# Pet Tracker App

The Pet Tracker App is a web application that helps veterinarians identify their patients and includes a warning if the pet is not friendly. 

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
- [API Documentation](#api-documentation)
- [Acknowledgements](#acknowledgements)

## Features

- **Add Pets:** Add information about your pet patients including their names, species, and profile picture. An option is included to indicate if the pet needs 

- **Remove Pets:** Remove a pet who is no longer a patient

## Technologies Used

- **Frontend:** [Svelte](https://svelte.dev/)
- **Backend:** [Flask](https://flask.palletsprojects.com/)
- **Database:** [SQLite](https://www.sqlite.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (for Svelte frontend)
- LTS Version: 20.10.0 
- npm 10.2.3

- [Python](https://www.python.org/) (for Flask backend)
- CORS

### Installation

1.	Clone the repository:
  	```bash
  	git clone https://github.com/LorenSklar/pet-tracker.git
	npm install cors (if not previously installed)
   	npm install sqlite3 (pre installed on Macs)

## Usage
1.	Launch backend:
  	```bash
  	cd pet-tracker/flask-app/src
  	python3 api.py
   	python3 db.py (to initialize database if no database exists)

Backend runs on http://127.0.0.1:5000/

2.	Launch frontend:
  	```bash
  	cd pet-tracker/svelte-app/src
	npm run dev

Front end runs on http://localhost:8080/

 ## API Documentation

 ## Acknowledgements
 Thank you to https://www.youtube.com/@koderhq for a quick introduction to Svelte and Rowan Carlsen and Manfred Joa for code review

