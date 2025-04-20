# Clink Dashboards (Customized Superset)

This directory contains a customized version of Apache Superset that has been whitelabeled to match the Clink SaaS application style.

## Customizations

The following customizations have been made to the standard Superset installation:

1. **Theme Overrides**: Custom color scheme and typography to match the Clink SaaS application
2. **Custom CSS**: Global CSS styles applied to all Superset pages
3. **CSS Template**: A dashboard-specific CSS template that can be applied to individual dashboards
4. **Branding**: Custom logo and application name
5. **Start Script**: Enhanced start script that loads the CSS template automatically

## Directory Structure

- `config/`: Configuration files for Superset
  - `superset_config.py`: Main configuration file with theme overrides and branding settings
  - `gunicorn_config.py`: Web server configuration
- `static/`: Static assets for Superset
  - `css/custom.css`: Global CSS styles for Superset
  - `assets/images/`: Directory for logo and favicon files
- `css_templates/`: CSS templates that can be loaded into Superset
  - `clink_theme.css`: Dashboard-specific CSS template
- `scripts/`: Utility scripts
  - `install-superset-fixed.sh`: Script to install Superset
  - `load_css_template.py`: Script to load the CSS template into Superset
- `sso/`: Single Sign-On integration files

## Getting Started

### Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- Node.js and npm (for building frontend assets)

### Installation

1. Run the installation script:
   ```bash
   ./scripts/install-superset-fixed.sh
   ```

2. Start Superset:
   ```bash
   ./start-local-superset.sh
   ```
   
   If port 8088 is already in use, you can specify a different port:
   ```bash
   ./start-local-superset.sh --port 8089
   ```

3. To stop Superset:
   ```bash
   ./stop-local-superset.sh
   ```

4. Access Superset at http://localhost:8088 (or the port you specified)
   - Default username: admin
   - Default password: admin

## Applying CSS Template to Dashboards

The CSS template is automatically loaded when Superset starts. To apply it to a dashboard:

1. Edit the dashboard
2. Click on the "..." menu in the top right
3. Select "Edit dashboard properties"
4. In the "CSS Template" dropdown, select "Clink Theme"
5. Click "Save"

## Customizing the Theme Further

### Modifying Theme Colors

To change the theme colors, edit the `THEME_OVERRIDES` section in `config/superset_config.py`.

### Modifying CSS Styles

To change the global CSS styles, edit `static/css/custom.css`.

### Modifying Dashboard-specific CSS

To change the dashboard-specific CSS template, edit `css_templates/clink_theme.css` and restart Superset.

### Adding Custom Logos

1. Add your logo files to the `static/assets/images/` directory:
   - `clink_logo.png`: Main logo (recommended size: 120px × 30px)
   - `clink_favicon.ico`: Favicon (recommended size: 32px × 32px)

2. Restart Superset for the changes to take effect.

## Troubleshooting

If you encounter issues with the customizations:

1. Check the Superset logs for errors
2. Ensure the CSS files are properly loaded
3. Clear your browser cache
4. Restart Superset

## License

Apache Superset is licensed under the Apache License 2.0.
