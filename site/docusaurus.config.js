// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Notion API Developer Documentation',
  tagline: 'Comprehensive guide for Notion API integration',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://KarthiDreamr.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/notion-api-docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'KarthiDreamr', // Usually your GitHub org/user name.
  projectName: 'notion-api-docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../docs',           // read content from repo/docs
          routeBasePath: 'docs',     // URLs like /docs/quickstart
          sidebarPath: require.resolve('./sidebars.js'),
          // Edit this page link
          editUrl: 'https://github.com/KarthiDreamr/notion-api-docs/tree/main/',
          // Show last update info
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false, // Disable blog for API docs (can re-enable later)
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Notion API Docs',
        logo: {
          alt: 'NotionLogo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Guides',
          },
          {
            to: '/api-reference',
            position: 'left',
            label: 'API Reference',
          },
          {
            href: 'https://github.com/KarthiDreamr/notion-api-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },

     footer: {
    style: 'dark',
    links: [
      {
        title: 'Documentation',
        items: [
          {
            label: 'Quickstart',
            to: '/docs/quickstart',
          },
          {
            label: 'API Reference',
            to: '/api-reference',
          },
        ],
      },
      {
        title: 'Community',
        items: [
          {
            label: 'GitHub Issues',
            href: 'https://github.com/KarthiDreamr/notion-api-docs/issues',
          },
        ],
      },
    ],
    copyright: `Copyright © ${new Date().getFullYear()} Notion API Docs. Built with Docusaurus.`,
  },
  
  // Search (Algolia DocSearch can be added later)
  // algolia: {
  //   appId: 'YOUR_APP_ID',
  //   apiKey: 'YOUR_SEARCH_API_KEY',
  //   indexName: 'notion-api-docs',
  // },


      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'javascript', 'python'],
      },
    }),
};

export default config;
