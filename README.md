# QuickPen

QuickPen is a web application designed to help writers build consistency through timed writing sprints. Track your progress, maintain streaks, and improve your writing habits.

## Features

- **Timed Writing Sprints**: Set custom duration goals and challenge yourself to write without distractions
- **Progress Tracking**: Monitor your word count, WPM, and writing streaks
- **Writing Analytics**: View your writing statistics and track improvement over time
- **Pro Features**: Advanced analytics, custom tags, and export options

## Try It Out

Visit [quick-pen.web.app](https://quick-pen.web.app) to start your writing journey.

### Free Tier

- Unlimited writing sprints
- Basic progress tracking
- Daily streaks

### Pro Tier ($5/month)

- Everything in Free
- Advanced analytics
- Custom tags
- Export options

## Development

While this is a commercial SaaS project, we welcome contributions from the community! The repository includes the React frontend and Firebase configuration, though sensitive credentials are managed through environment variables, so open-source developers should focus on frontend contributions.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone and install dependencies:

   ```bash
   git clone https://github.com/nbird11/quick-pen.git
   cd quick-pen
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment to Firebase Hosting.

### Automatic Deployments

- Merges to `main` branch automatically deploy to [quickpen.web.app](https://quickpen.web.app)
- Pull requests generate preview deployments for testing

## Contributing

We appreciate all contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Prototyped with vanilla JS and a Go backend
- Migrated to React and Firebase
- Inspired by my wife's writing sprint techniques and habit-building principles

## License

This project is licensed under the MIT License - see the LICENSE file for details.
