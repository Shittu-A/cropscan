# How to Get Your Hugging Face API Key

This guide will walk you through creating a Hugging Face account and generating an API key for CropScan.

---

## Step 1: Create a Hugging Face Account

1. Go to [huggingface.co](https://huggingface.co)
2. Click the **"Sign Up"** button in the top right corner
3. You can sign up with:
   - Email and password
   - GitHub account
   - Google account
4. Complete the registration process
5. Verify your email if required

---

## Step 2: Navigate to Access Tokens

1. Once logged in, click on your **profile picture** in the top right corner
2. Select **"Settings"** from the dropdown menu
3. In the left sidebar, click on **"Access Tokens"**

**Direct URL**: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

---

## Step 3: Generate a New Token

1. Click the **"New token"** button
2. Give your token a name (e.g., "CropScan" or "Plant Disease App")
3. Select the token type:
   - **"Read"** - This is sufficient for CropScan (we only need to call the inference API)
4. Click **"Generate a token"**

---

## Step 4: Copy Your Token

1. Your new token will be displayed
2. **IMPORTANT**: Copy it immediately - you won't be able to see it again!
3. Store it somewhere safe (password manager, etc.)

The token will look something like this:
```
hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 5: Add to Your Project

1. Open your `.env.local` file in the CropScan project
2. Add your token:
   ```
   HF_API_KEY=hf_your_token_here
   ```
3. Save the file

---

## Step 6: Test the API

Start your development server:
```bash
npm run dev
```

Then test the detection API:
```bash
curl http://localhost:3000/api/detect
```

You should see:
```json
{"status":"ok","model":"linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"}
```

---

## Free Tier Limits

Hugging Face Inference API has generous free limits:
- **No credit card required**
- Rate limits apply but are suitable for testing and small apps
- For higher limits, you can upgrade to Pro

---

## Troubleshooting

### "Invalid token" error
- Make sure you copied the entire token (starts with `hf_`)
- Check for extra spaces when pasting
- Regenerate the token if needed

### "Rate limit exceeded" error
- You've hit the free tier limits
- Wait a few minutes and try again, or consider upgrading

### Token not working
- Ensure the token has "Read" permissions
- Verify the token is active (not revoked)
- Check your `.env.local` file is in the project root

---

## Security Best Practices

1. **Never commit your API key** to git (it's in `.env.local` which is in `.gitignore`)
2. **Don't share your token** with others
3. **Rotate tokens periodically** for security
4. **Revoke unused tokens** in your Hugging Face settings

---

## Need Help?

- Hugging Face Docs: [huggingface.co/docs](https://huggingface.co/docs)
- Inference API Docs: [huggingface.co/docs/api-inference](https://huggingface.co/docs/api-inference)
