# Add DigitalOcean Spaces Credentials

## Problem
File uploads are failing because the DigitalOcean Spaces credentials are missing from `.env.local`.

## Solution

Add these environment variables to your `.env.local` file:

```env
# DigitalOcean Spaces Configuration
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_REGION=nyc3
DO_SPACES_KEY=your_access_key_here
DO_SPACES_SECRET=your_secret_key_here
DO_SPACES_BUCKET=ableman-llc
```

## Where to Get the Credentials

### Option 1: From the Lender Portal
If you have the lender portal (ablemanadminportal-main) set up, copy the credentials from there:

```bash
# Navigate to the lender portal
cd ../ablemanadminportal-main

# View the credentials
cat .env | grep DO_SPACES
```

Then copy those values to the deals portal `.env.local` file.

### Option 2: From DigitalOcean Dashboard

1. Log in to your DigitalOcean account
2. Go to **API** → **Spaces Keys**
3. Copy your **Access Key** and **Secret Key**
4. Add them to `.env.local` as shown above

## Steps to Fix

1. **Open** `ableman-deals-page-main/.env.local`

2. **Add** the DigitalOcean Spaces credentials:
   ```env
   DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
   DO_SPACES_REGION=nyc3
   DO_SPACES_KEY=YOUR_ACCESS_KEY
   DO_SPACES_SECRET=YOUR_SECRET_KEY
   DO_SPACES_BUCKET=ableman-llc
   ```

3. **Replace** `YOUR_ACCESS_KEY` and `YOUR_SECRET_KEY` with your actual credentials

4. **Restart** your Next.js dev server:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

5. **Test** file upload in the buyer portal at `/buyer/inbox`

## Verification

After adding the credentials and restarting:

1. Go to `/buyer/inbox`
2. Select a conversation
3. Click the paperclip icon to attach a file
4. Select a file (image or PDF)
5. The file should upload successfully and appear in the chat

## Security Notes

⚠️ **Important**:
- Never commit `.env.local` to version control
- Keep your DigitalOcean credentials secure
- The `.env.local` file is already in `.gitignore`

## Troubleshooting

If uploads still fail after adding credentials:

1. **Check the server console** for error messages
2. **Verify credentials** are correct in DigitalOcean dashboard
3. **Ensure the bucket exists**: `ableman-llc` should be created in DigitalOcean Spaces
4. **Check bucket permissions**: Make sure the bucket allows public read access for uploaded files
5. **Test credentials** with this command:
   ```bash
   # Test if environment variables are loaded
   node -e "console.log(process.env.DO_SPACES_KEY)"
   ```
