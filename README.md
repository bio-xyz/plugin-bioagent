# BioAgent Plugin 🤖🧬

An Eliza plugin tailored for researchers and bioscientists, converting scientific papers into structured Knowledge Assets (KAs). These Knowledge Assets integrate seamlessly into RDF triple stores such as [OriginTrail's DKG](https://origintrail.io/technology/decentralized-knowledge-graph) or [Oxigraph](https://github.com/oxigraph/oxigraph), enhancing data management and advancing biological research capabilities. 📄🔍🌐

## 🚀 How It Works

The BioAgent Plugin continuously monitors a specified Google Drive folder for new scientific documents. Upon detection, it automatically transforms these papers into structured Knowledge Assets and incorporates them into a dynamic knowledge graph. An intelligent agent explores this graph to systematically generate novel biological hypotheses across multiple domains, including genetics, molecular biology, and biotechnology. These hypotheses are then rigorously evaluated and scored by the integrated JudgeLLM according to a precise rubric, ensuring their accuracy and relevance. By default, this cycle of hypothesis generation and evaluation occurs every 90 seconds, but the frequency can be customized. 🔄🤖✨

> [!IMPORTANT]
> This plugin is currently under development and requires additional refinement before production use. Note that the Google Drive webhook functionality only works with publicly accessible URLs. For local development, we're using ngrok to create a temporary public endpoint for the webhook. In future versions, we plan to implement a simpler approach that directly monitors changes to a local folder.
> Also the database migrations need to be run manually right now. In the future we plan to create a CLI version of this plugin that will handle the database migrations and other setup tasks.

> [!NOTE]
> This plugin is already added to the BioAgents repo here: https://github.com/bio-xyz/bioagents

## 🛠 Getting Started

Follow these steps to install and launch the BioAgent Plugin:

### 1. Install System Dependencies

Ensure the following dependencies are installed on your system:

```bash
# For Ubuntu/Debian
sudo apt-get install ghostscript graphicsmagick
```

### 2. Clone the Repository

```bash
git clone https://github.com/bio-xyz/plugin-bioagent.git
cd plugin-bioagent
```

### 3. Install Project Dependencies

```bash
pnpm install
```

### 4. Start Required Docker Containers

Start PostgreSQL with pgvector extension for vector storage:

```bash
docker run --name plugin-bioagent-postgres -e POSTGRES_PASSWORD=123 -p 5432:5432 -d pgvector/pgvector:pg17
```

Start Oxigraph RDF triple store or use OriginTrail's DKG:

```bash
docker run --rm -v $PWD/oxigraph:/data -p 7878:7878 ghcr.io/oxigraph/oxigraph serve --location /data --bind 0.0.0.0:7878
```

### 5. Run Database Migrations

After starting the Docker containers, generate and run the database migrations:

```bash
pnpm run db:generate
pnpm run db:migrate
```

### 6. Launch the Development Server

```bash
pnpm run dev
```

This command starts the development server at `http://localhost:3000`. Allow around 90 seconds for initial setup, after which the BioAgent Plugin will begin generating and evaluating hypotheses.

## 🔧 Configure Environment Variables

Copy and rename the example environment file:

```bash
mv .env.example .env
```

### Essential Environment Variables

Update your `.env` file with the following variables:

```env
POSTGRES_URL=postgresql://user:password@localhost:5432/dbname
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GCP_JSON_CREDENTIALS={"type": "service_account", "project_id": "your_project_id", ...}  # Your full GCP service account JSON
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id  # Google Drive folder ID for scientific papers
DISCORD_APPLICATION_ID=your_discord_app_id
DISCORD_API_TOKEN=your_discord_bot_token
DISCORD_VOICE_CHANNEL_ID=your_voice_channel_id  # Optional
DISCORD_CHANNEL_ID=your_text_channel_id
BIONTOLOGY_KEY=your_biontology_api_key  # Obtain at https://bioportal.bioontology.org/accounts/new
```

## 📋 Obtaining Google Cloud Service Account JSON & Setting Permissions

### Creating a Service Account

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create your desired project.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **+ CREATE CREDENTIALS**, then select **Service Account**.
5. Provide a descriptive name for the service account and click **Create**.
6. Assign necessary roles (e.g., Editor) and click **Continue**.
7. Open the newly created service account, go to the **Keys** tab.
8. Click **Add Key** > **Create new key**, choose **JSON**, and click **Create**. The JSON file will automatically download.

### Granting Access to Google Drive Folder

1. Open your [Google Drive](https://drive.google.com/).
2. Navigate to the folder associated with the `GOOGLE_DRIVE_FOLDER_ID`.
3. Right-click the folder and select **Share**.
4. Enter the service account email (available in your downloaded JSON file) into the sharing field.
5. Set permissions ("Editor" or "Viewer") accordingly and click **Send**.

Your Google Cloud service account now has access to the specified folder. 📁🔑✅
