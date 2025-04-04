# Local Development Setup

## Prerequisites

- Node.js 23.3.0 or later
- pnpm 9.15.4
- Git
- Python 3
- FFmpeg
- Ghostscript
- GraphicsMagick
- PostgreSQL

## System Dependencies

### Ubuntu/Debian

```bash
sudo apt-get update && sudo apt-get install -y \
    git \
    python3 \
    python3-pip \
    curl \
    node-gyp \
    ffmpeg \
    libtool-bin \
    autoconf \
    automake \
    libopus-dev \
    make \
    g++ \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    openssl \
    libssl-dev \
    libsecret-1-dev \
    ghostscript \
    graphicsmagick
```

### macOS

```bash
brew install \
    git \
    python3 \
    ffmpeg \
    ghostscript \
    graphicsmagick \
    libtool \
    autoconf \
    automake \
    opus \
    cairo \
    pango \
    libgif \
    openssl
```

## Project Setup

1. Clone the repository:

```bash
git clone https://github.com/bio-xyz/BioAgents.git
cd BioAgents
```

2. Install pnpm:

```bash
npm install -g pnpm@9.15.4
```

3. Install dependencies (Ingnore the `bun.lock` file for now):

```bash
pnpm install
```

4. Set up environment variables:

```bash
cp .env.example .env
```

For basic working just add `OPENAI_API_KEY=` and `ANTHROPIC_API_KEY=` and remove the rest (important)

Edit `.env` with your configuration values.

5. Start the development server:

```bash
pnpm run dev
```

## Database Setup (OPTIONAL)

1. Install and start PostgreSQL (docker preferred)
2. Create a database
3. Update `POSTGRES_URL` in your `.env` file with your database credentials
