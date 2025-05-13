# BI Engine

BI Engine is a whitelabeled version of Apache Superset, a modern data exploration and visualization platform.

## Features

- Interactive dashboards
- Rich visualization library
- SQL Lab for querying and exploring data
- Customizable charts and dashboards
- Role-based access control
- Database connectivity to various data sources

## Prerequisites

- Docker and Docker Compose
- PostgreSQL database (for application data)

## Installation

The BI Engine is packaged as a set of Docker containers that can be easily started and stopped.

### Starting BI Engine

To start BI Engine, run:

```bash
./start-biengine.sh
```

This will start the following containers:
- BI Engine web application (Superset)
- BI Engine worker for async tasks
- Redis for caching and message queue
- PostgreSQL database for BI Engine metadata

### Accessing BI Engine

Once started, BI Engine will be available at:

- URL: http://localhost:8089
- Default credentials: admin / admin

### Stopping BI Engine

To stop BI Engine, run:

```bash
./stop-biengine.sh
```

## Configuration

The main configuration files are located in the `config` directory:

- `superset_config.py`: Main configuration file for Superset
- `gunicorn_config.py`: Web server configuration

## Customization

BI Engine comes with custom styling to match your brand:

- Custom CSS in `static/css/custom.css`
- Dashboard CSS templates in `css_templates/biengine_theme.css`

## Connecting to Data Sources

To connect to your data sources:

1. Log in to BI Engine
2. Go to "Data" > "Databases"
3. Click "+ Database" to add a new database connection
4. Configure the connection details for your database

## Creating Dashboards

To create a new dashboard:

1. First create charts by going to "Charts" and clicking "+ Chart"
2. Select your data source and visualization type
3. Configure your chart and save it
4. Go to "Dashboards" and click "+ Dashboard"
5. Add your saved charts to the dashboard
6. Arrange and resize the charts as needed
7. Save your dashboard

## Troubleshooting

If you encounter issues:

- Check the container logs: `docker-compose logs`
- Ensure all containers are running: `docker-compose ps`
- Verify database connectivity
- Check for port conflicts on 8089, 6380, or 5433

## License

Apache Superset is licensed under the Apache License 2.0.
