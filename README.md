# Kindle Dashboard

A dashboard application designed to display weather and calendar information on a Kindle device. The project consists of a React-based dashboard and supporting scripts for data collection and rendering.

## Features

- Current weather display with temperature and conditions
- 8-hour weather forecast
- Calendar events display
- Timestamp display
- Optimized for Kindle e-ink display

## Project Structure

```
kindle-dashboard/
├── dashboard/           # React dashboard application
├── glyphs/             # Weather icon glyphs
├── scripts/            # Data collection and rendering scripts
└── keys.sh            # API keys and configuration (not in git)
```

## Setup

1. Clone the repository:
   ```bash
   git clone git@github.com:gusost/kindle-dashboard.git
   cd kindle-dashboard
   ```

2. Create a `keys.sh` file with your API keys:
   ```bash
   #!/bin/bash
   export API_KEY=your_openweathermap_api_key
   export CITY=your_city
   export LAT=your_latitude
   export LON=your_longitude
   export UNITS=metric
   ```

3. Make the scripts executable:
   ```bash
   chmod +x get-weather.sh keys.sh
   ```

4. Install dashboard dependencies:
   ```bash
   cd dashboard
   npm install
   ```

## Usage

### Data Collection

- Run `./get-weather.sh` to fetch current weather and forecast data
- The script will update both the root and dashboard data files

### Dashboard Development

```bash
cd dashboard
npm start
```

### Building for Production

```bash
cd dashboard
npm run build
```

## Deployment

The dashboard is designed to be served on a local network and accessed by a Kindle device. The Kindle's browser can be configured to display the dashboard in full-screen mode.

## Security Notes

- API keys and sensitive information are stored in `keys.sh` which is excluded from git
- Never commit `keys.sh` or any files containing API keys
- Keep a backup of your `keys.sh` file in a secure location

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 