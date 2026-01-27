# College Admin Portal

A full Django project for managing colleges, applications, and brochures with a dual-role system (SuperAdmin & College Admin).

## Features
- **SuperAdmin**: Managed via Django Admin. Can create College Admins.
- **College Admin**: 
    - Auto-generated credentials emailed upon creation.
    - Forced Password Reset on first login.
    - Dashboard to manage Applications, Brochures, and Colleges.
- **Tech Stack**: Django 5+, Bootstrap 5, SQLite.

## Setup & Run

1. **Install Dependencies** (if not already):
   ```bash
   pip install django pillow
   ```

2. **Initialize Database**:
   ```bash
   python manage.py migrate
   ```

3. **Create Superuser** (Script provided):
   ```bash
   python create_superuser.py
   # User: superadmin / Pass: Admin123!
   ```

4. **Run Server**:
   ```bash
   python manage.py runserver
   ```

## Usage Flow

1. **Go to `/admin/`**: Login as `superadmin`.
2. **Create User**: Add a new User. 
   - Set `College ID`.
   - Result: Check your console! The email with the temp password will be printed there.
3. **Go to `/login/`**: Use the credentials from the console.
4. **Force Reset**: You will be redirected to reset your password.
5. **Dashboard**: Access the portal.

## Project Structure
- `portal/`: Main app containing Models, Views, Templates.
- `portal/templates/`: Bootstrap 5 HTML templates.
- `config/settings.py`: Configuration.
