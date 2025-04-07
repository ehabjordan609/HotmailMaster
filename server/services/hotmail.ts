import { Account } from "@shared/schema";
import { generateRandomUsername } from "../../client/src/lib/utils";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import type { Browser, Page } from 'puppeteer';

// Add stealth plugin to puppeteer to avoid detection
puppeteer.use(StealthPlugin());

// Configure the recaptcha plugin
// With an undefined API key, it will note captcha issues but not solve them
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: 'nopecha',
      token: process.env.CAPTCHA_API_KEY || undefined
    },
    visualFeedback: true // Display the solved recaptcha
  })
);

interface HotmailEmail {
  sender: string;
  subject: string;
  content: string;
  preview: string;
}

interface BatchResults {
  successCount: number;
  failedCount: number;
  captchaBlocked: number;
  accounts: Account[];
  failedAccounts: {email: string; reason: string}[];
}

// Helper function to generate personal information for registration
const generatePersonalInfo = () => {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  // Generate a random birth date (18-50 years old)
  const now = new Date();
  const year = now.getFullYear() - Math.floor(Math.random() * 32) - 18;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  
  return {
    firstName,
    lastName,
    birthYear: year,
    birthMonth: month,
    birthDay: day
  };
};

// Helper to delay execution (for throttling)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Implementation for automating Hotmail account creation and email reading
 * This version implements real account creation with CAPTCHA handling
 */
export const hotmailService = {
  /**
   * Create a new Hotmail account
   * @returns Object indicating success and captcha status
   */
  createAccount: async (email: string, password: string): Promise<{success: boolean; captchaBlocked: boolean; error?: string}> => {
    // Extract username from email
    const username = email.split('@')[0];
    
    console.log(`Creating account for ${email} with password ${password}`);
    
    // If simulation mode, don't actually create the account
    if (process.env.ENABLE_REAL_ACCOUNT_CREATION !== 'true') {
      console.log('Simulating account creation...');
      await delay(1000);
      console.log('Simulated account creation completed');
      return { success: true, captchaBlocked: false };
    }
    
    let browser: Browser | null = null;
    
    try {
      console.log('Launching browser for real account creation...');
      
      // Launch browser with stealth mode
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false', // Set to false for debugging
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--window-size=1366,768',
        ]
      });
      
      const page = await browser.newPage();
      
      // Set a realistic viewport
      await page.setViewport({
        width: 1366,
        height: 768
      });
      
      // Set a user agent that doesn't trigger bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to Microsoft account signup with debugging information
      const response = await page.goto('https://outlook.live.com/owa/?nlp=1&signup=1', { waitUntil: 'networkidle2' });
      console.log('Navigated to Microsoft signup page');
      console.log('Current URL:', page.url());
      
      // Log page HTML for debugging
      const pageContent = await page.content();
      console.log('Page content length:', pageContent.length);
      console.log('Page content sample:', pageContent.substring(0, 500) + '...');
      
      // Take screenshot for debugging
      await page.screenshot({ path: '/tmp/signup-page.png' });
      console.log('Saved screenshot to /tmp/signup-page.png');
      
      // Generate random personal info
      const personalInfo = generatePersonalInfo();
      
      try {
        // Kiểm tra và nhận biết định dạng form đăng ký hiện tại
        console.log('Kiểm tra cấu trúc trang đăng ký');
        
        // Thử cả hai cách để xác định phiên bản UI nào đang được sử dụng
        const isNewUI = await Promise.race([
          page.waitForSelector('input[name="MemberName"]', { timeout: 5000 }).then(() => true).catch(() => false),
          page.waitForSelector('#MemberName', { timeout: 5000 }).then(() => true).catch(() => false)
        ]);
        
        if (isNewUI) {
          // Step 1: Enter email address
          console.log('Entering email address (new UI)');
          // Kiểm tra cả hai selector có thể có
          try {
            await page.waitForSelector('input[name="MemberName"]', { timeout: 5000 });
            await page.type('input[name="MemberName"]', username);
          } catch (e) {
            await page.waitForSelector('#MemberName', { timeout: 5000 });
            await page.type('#MemberName', username);
          }
          
          // Tìm nút tiếp theo bằng nhiều cách khác nhau
          try {
            await page.waitForSelector('#iSignupAction', { timeout: 5000 });
            await page.click('#iSignupAction');
          } catch (e) {
            try {
              await page.waitForSelector('input[type="submit"]', { timeout: 5000 });
              await page.click('input[type="submit"]');
            } catch (e2) {
              const nextButtons = await page.$$('button');
              if (nextButtons.length > 0) {
                await nextButtons[nextButtons.length - 1].click();
              }
            }
          }
          await delay(2000);
          
          // Step 2: Enter password
          console.log('Entering password');
          try {
            await page.waitForSelector('#PasswordInput', { timeout: 5000 });
            await page.type('#PasswordInput', password);
          } catch (e) {
            await page.waitForSelector('input[name="Password"]', { timeout: 5000 });
            await page.type('input[name="Password"]', password);
          }
          
          // Nhấn nút tiếp theo
          try {
            await page.waitForSelector('#iSignupAction', { timeout: 5000 });
            await page.click('#iSignupAction');
          } catch (e) {
            try {
              await page.waitForSelector('input[type="submit"]', { timeout: 5000 });
              await page.click('input[type="submit"]');
            } catch (e2) {
              const nextButtons = await page.$$('button');
              if (nextButtons.length > 0) {
                await nextButtons[nextButtons.length - 1].click();
              }
            }
          }
          await delay(2000);
          
          // Step 3: Enter personal information
          console.log('Entering personal information');
          try {
            await page.waitForSelector('#FirstName', { timeout: 5000 });
            await page.type('#FirstName', personalInfo.firstName);
            await page.type('#LastName', personalInfo.lastName);
          } catch (e) {
            await page.waitForSelector('input[name="FirstName"]', { timeout: 5000 });
            await page.type('input[name="FirstName"]', personalInfo.firstName);
            await page.type('input[name="LastName"]', personalInfo.lastName);
          }
          
          // Nhấn nút tiếp theo
          try {
            await page.waitForSelector('#iSignupAction', { timeout: 5000 });
            await page.click('#iSignupAction');
          } catch (e) {
            try {
              await page.waitForSelector('input[type="submit"]', { timeout: 5000 });
              await page.click('input[type="submit"]');
            } catch (e2) {
              const nextButtons = await page.$$('button');
              if (nextButtons.length > 0) {
                await nextButtons[nextButtons.length - 1].click();
              }
            }
          }
          await delay(2000);
          
          // Step 4: Enter birth date
          console.log('Entering birth date');
          try {
            await page.waitForSelector('#BirthDay', { timeout: 5000 });
            await page.select('#BirthDay', personalInfo.birthDay.toString());
            await page.select('#BirthMonth', personalInfo.birthMonth.toString());
            await page.type('#BirthYear', personalInfo.birthYear.toString());
          } catch (e) {
            // Thử với các selector khác
            try {
              await page.waitForSelector('select[name="BirthDay"]', { timeout: 5000 });
              await page.select('select[name="BirthDay"]', personalInfo.birthDay.toString());
              await page.select('select[name="BirthMonth"]', personalInfo.birthMonth.toString());
              await page.type('input[name="BirthYear"]', personalInfo.birthYear.toString());
            } catch (e2) {
              // Thử tìm tất cả các thẻ select và nhập vào
              const selects = await page.$$('select');
              if (selects.length >= 2) {
                await selects[0].select(personalInfo.birthMonth.toString());
                await selects[1].select(personalInfo.birthDay.toString());
                
                // Tìm input cho năm sinh
                const inputs = await page.$$('input[type="text"]');
                for (const input of inputs) {
                  const placeholder = await page.evaluate(el => el.getAttribute('placeholder'), input);
                  if (placeholder && (placeholder.includes('Year') || placeholder.includes('năm'))) {
                    await input.type(personalInfo.birthYear.toString());
                    break;
                  }
                }
              }
            }
          }
        } else {
          // Xử lý trường hợp không tìm thấy selector nào - có thể là trang đăng ký khác hoàn toàn
          console.log('Không nhận diện được cấu trúc form, thử phương pháp khác');
          
          // Tìm tất cả các trường nhập liệu và điền thông tin
          const inputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
          
          if (inputs.length >= 1) {
            // Giả định input đầu tiên là email/username
            await inputs[0].type(username);
            
            // Tìm và nhấn nút tiếp theo
            const buttons = await page.$$('button, input[type="submit"]');
            if (buttons.length > 0) {
              await buttons[buttons.length - 1].click();
              await delay(2000);
            }
          }
          
          // Sau khi chuyển trang, tìm trường password
          const passwordInputs = await page.$$('input[type="password"]');
          if (passwordInputs.length > 0) {
            await passwordInputs[0].type(password);
            
            // Tìm và nhấn nút tiếp theo
            const buttons = await page.$$('button, input[type="submit"]');
            if (buttons.length > 0) {
              await buttons[buttons.length - 1].click();
              await delay(2000);
            }
          }
          
          // Sau đó nhập thông tin cá nhân nếu có
          const nameInputs = await page.$$('input[type="text"]');
          if (nameInputs.length >= 2) {
            await nameInputs[0].type(personalInfo.firstName);
            await nameInputs[1].type(personalInfo.lastName);
            
            // Tìm và nhấn nút tiếp theo
            const buttons = await page.$$('button, input[type="submit"]');
            if (buttons.length > 0) {
              await buttons[buttons.length - 1].click();
              await delay(2000);
            }
          }
          
          // Cuối cùng nhập ngày sinh nếu có
          const selects = await page.$$('select');
          if (selects.length >= 2) {
            await selects[0].select(personalInfo.birthMonth.toString());
            await selects[1].select(personalInfo.birthDay.toString());
            
            // Tìm input năm
            const yearInputs = await page.$$('input[type="text"]');
            if (yearInputs.length > 0) {
              await yearInputs[yearInputs.length - 1].type(personalInfo.birthYear.toString());
            }
          }
        }
        await page.click('#iSignupAction');
        await delay(2000);
        
        // Check for CAPTCHA
        let captchaDetected = false;
        
        try {
          console.log('Checking for CAPTCHA...');
          
          // Look for different types of CAPTCHA elements
          const captchaSelectors = [
            'iframe[src*="recaptcha/api2"]',
            'iframe[src*="captcha"]',
            '#captcha',
            '#hipCaptcha',
            '.captchaContainer'
          ];
          
          for (const selector of captchaSelectors) {
            const hasSelector = await page.$(selector);
            if (hasSelector) {
              console.log(`CAPTCHA detected via selector: ${selector}`);
              captchaDetected = true;
              break;
            }
          }
          
          if (!captchaDetected) {
            // Check page content for CAPTCHA indicators
            const pageContent = await page.content();
            if (
              pageContent.includes('captcha') ||
              pageContent.includes('CAPTCHA') ||
              pageContent.includes('verify you\'re not a robot') ||
              pageContent.includes('security check')
            ) {
              console.log('CAPTCHA detected via page content');
              captchaDetected = true;
            }
          }
          
          if (captchaDetected) {
            // If we have an API key, try to solve the CAPTCHA
            if (process.env.CAPTCHA_API_KEY) {
              console.log('Attempting to solve CAPTCHA with API key');
              try {
                await page.solveRecaptchas();
                console.log('CAPTCHA solved successfully');
                await page.click('#iSignupAction');
                captchaDetected = false;
              } catch (solvingError) {
                console.error('Failed to solve CAPTCHA:', solvingError);
                // Still blocked by CAPTCHA
                return { success: false, captchaBlocked: true, error: 'Failed to solve CAPTCHA' };
              }
            } else {
              console.log('No CAPTCHA API key available - cannot proceed with account creation');
              return { success: false, captchaBlocked: true, error: 'CAPTCHA detected but no API key available' };
            }
          } else {
            console.log('No CAPTCHA detected');
          }
        } catch (captchaError) {
          console.log('Error during CAPTCHA detection:', captchaError);
          // Continue anyway, as this might be a false alarm
        }
        
        if (!captchaDetected) {
          // Wait for navigation to indicate success
          try {
            console.log('Waiting for registration completion...');
            await page.waitForNavigation({ timeout: 30000 });
            
            // Check if we're on a success page
            const currentUrl = page.url();
            if (
              currentUrl.includes('account.microsoft.com') || 
              currentUrl.includes('outlook.live.com') ||
              currentUrl.includes('success')
            ) {
              console.log('Account created successfully!');
              return { success: true, captchaBlocked: false };
            } else {
              console.log('Registration completed, but success status unclear. Current URL:', currentUrl);
              return { success: true, captchaBlocked: false };
            }
          } catch (navigationError) {
            console.log('Navigation timeout - account creation may have succeeded:', navigationError);
            return { success: true, captchaBlocked: false };
          }
        }
      } catch (formError: any) {
        console.error('Error during form filling:', formError);
        return { 
          success: false, 
          captchaBlocked: false, 
          error: `Form filling error: ${formError.message || 'Unknown error'}` 
        };
      }
    } catch (error: any) {
      console.error(`Account creation error for ${email}:`, error);
      return { 
        success: false, 
        captchaBlocked: false, 
        error: `General error: ${error.message || 'Unknown error'}` 
      };
    } finally {
      // Always close the browser
      if (browser) {
        await browser.close();
        console.log('Browser closed');
      }
    }
    
    // If we got here, it likely means we were blocked by CAPTCHA
    return { success: false, captchaBlocked: true, error: 'CAPTCHA likely blocked account creation' };
  },
  
  /**
   * Create multiple Hotmail accounts in batch
   */
  createBatchAccounts: async (quantity: number, prefix: string): Promise<BatchResults> => {
    console.log(`Creating ${quantity} accounts with prefix ${prefix}`);
    
    const accounts: Account[] = [];
    const failedAccounts: {email: string; reason: string}[] = [];
    let successCount = 0;
    let failedCount = 0;
    let captchaBlocked = 0;
    
    for (let i = 0; i < quantity; i++) {
      // Generate a unique username with the prefix
      const username = generateRandomUsername(prefix);
      const email = `${username}@hotmail.com`;
      
      // Generate a strong password that meets Microsoft requirements
      // At least 8 characters, mix of uppercase, lowercase, numbers and symbols
      const password = `${prefix.charAt(0).toUpperCase()}${prefix.slice(1)}${Math.floor(Math.random() * 10000)}!Aa`;
      
      try {
        const result = await hotmailService.createAccount(email, password);
        
        if (result.success) {
          // Add to our successful accounts list
          accounts.push({
            id: i + 1,
            label: `${prefix} Account ${i + 1}`,
            email,
            password,
            status: "active",
            lastChecked: new Date(),
            unreadCount: 0,
            autoMaintain: true,
            createdAt: new Date()
          });
          
          successCount++;
          console.log(`Successfully created account: ${email}`);
        } else if (result.captchaBlocked) {
          captchaBlocked++;
          failedAccounts.push({
            email,
            reason: `CAPTCHA blocked: ${result.error || 'No API key available'}`
          });
          console.log(`Account creation blocked by CAPTCHA: ${email}`);
        } else {
          failedCount++;
          failedAccounts.push({
            email,
            reason: result.error || 'Unknown error'
          });
          console.error(`Failed to create account: ${email}`, result.error);
        }
      } catch (error: any) {
        failedCount++;
        failedAccounts.push({
          email,
          reason: error.message || 'Unknown error'
        });
        console.error(`Exception during account creation: ${email}`, error);
      }
      
      // Add delay between attempts to avoid triggering anti-bot detection
      const delayTime = Math.floor(Math.random() * 2000) + 3000; // 3-5 second random delay
      console.log(`Waiting ${delayTime}ms before next account creation...`);
      await delay(delayTime);
    }
    
    return {
      successCount,
      failedCount,
      captchaBlocked,
      accounts,
      failedAccounts
    };
  },
  
  /**
   * Maintain a Hotmail account to keep it active
   */
  maintainAccount: async (email: string, password: string): Promise<{success: boolean; error?: string}> => {
    console.log(`Maintaining account: ${email}`);
    
    if (process.env.ENABLE_REAL_ACCOUNT_MAINTENANCE !== 'true') {
      // Simulate maintenance activity in development mode
      console.log('Simulating account maintenance...');
      await delay(1000);
      console.log('Simulated maintenance completed');
      return { success: true };
    }
    
    let browser: Browser | null = null;
    
    try {
      console.log('Launching browser for account maintenance...');
      
      // Launch browser with stealth mode
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--window-size=1366,768',
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to Outlook login
      await page.goto('https://outlook.live.com/owa/', { waitUntil: 'networkidle2' });
      console.log('Navigated to Outlook login page');
      
      try {
        // Click sign in if on the main page
        try {
          const signInButton = await page.$('a[data-task="signin"]');
          if (signInButton) {
            await signInButton.click();
            await delay(2000);
          }
        } catch (e) {
          // May already be on sign-in page
          console.log('Already on sign-in page or button not found');
        }
        
        // Enter email
        console.log('Entering email');
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', email);
        await page.click('input[type="submit"]');
        await delay(2000);
        
        // Enter password
        console.log('Entering password');
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        await page.type('input[type="password"]', password);
        await page.click('input[type="submit"]');
        await delay(2000);
        
        // Handle "Stay signed in?" prompt if it appears
        try {
          const staySignedInButton = await page.$('#idBtn_Back');
          if (staySignedInButton) {
            await staySignedInButton.click(); // "No" button
            await delay(2000);
          }
        } catch (e) {
          console.log('No "Stay signed in" prompt or already handled');
        }
        
        // Wait for inbox to load
        console.log('Waiting for inbox to load');
        await page.waitForSelector('div[role="main"]', { timeout: 30000 });
        console.log('Inbox loaded successfully');
        
        // Perform maintenance activities:
        await performRandomInboxActivities(page);
        
        // Log out properly
        console.log('Logging out');
        const accountManagerButton = await page.$('button[aria-label*="Account manager"]');
        if (accountManagerButton) {
          await accountManagerButton.click();
          await delay(1000);
          
          const signOutLink = await page.$('a[aria-label*="Sign out"]');
          if (signOutLink) {
            await signOutLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
          }
        }
        
        console.log('Account maintenance completed successfully');
        return { success: true };
      } catch (loginError: any) {
        console.error('Error during login or maintenance:', loginError);
        return { 
          success: false, 
          error: `Login error: ${loginError.message || 'Unknown error'}` 
        };
      }
    } catch (error: any) {
      console.error(`Account maintenance error for ${email}:`, error);
      return { 
        success: false, 
        error: `General error: ${error.message || 'Unknown error'}` 
      };
    } finally {
      // Always close the browser
      if (browser) {
        await browser.close();
        console.log('Browser closed');
      }
    }
  },
  
  /**
   * Fetch emails from a Hotmail account
   */
  fetchEmails: async (email: string, password: string): Promise<HotmailEmail[]> => {
    console.log(`Fetching emails for: ${email}`);
    
    if (process.env.ENABLE_REAL_EMAIL_FETCHING !== 'true') {
      // Return mock emails in development mode
      console.log('Returning mock emails in development mode');
      await delay(1000);
      
      return [
        {
          sender: "Microsoft Account Team",
          subject: "Welcome to your new account",
          content: "Thank you for creating a Microsoft account. Your account is now active and ready to use. You can access your emails, OneDrive storage, and other Microsoft services with this account.",
          preview: "Thank you for creating a Microsoft account. Your account is now active and ready to use."
        },
        {
          sender: "Outlook Team",
          subject: "Get started with Outlook",
          content: "Here are some tips to help you get started with your new Outlook account. Learn how to organize your inbox, create folders, and customize your experience.",
          preview: "Here are some tips to help you get started with your new Outlook account."
        }
      ];
    }
    
    let browser: Browser | null = null;
    
    try {
      console.log('Launching browser for email fetching...');
      
      // Launch browser with stealth mode
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--window-size=1366,768',
        ]
      });
      
      const page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to Outlook login
      await page.goto('https://outlook.live.com/owa/', { waitUntil: 'networkidle2' });
      console.log('Navigated to Outlook login page');
      
      const emails: HotmailEmail[] = [];
      
      try {
        // Sign in process - same as maintenance
        try {
          const signInButton = await page.$('a[data-task="signin"]');
          if (signInButton) {
            await signInButton.click();
            await delay(2000);
          }
        } catch (e) {
          console.log('Already on sign-in page or button not found');
        }
        
        // Enter email
        console.log('Entering email');
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', email);
        await page.click('input[type="submit"]');
        await delay(2000);
        
        // Enter password
        console.log('Entering password');
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        await page.type('input[type="password"]', password);
        await page.click('input[type="submit"]');
        await delay(2000);
        
        // Handle "Stay signed in?" prompt if it appears
        try {
          const staySignedInButton = await page.$('#idBtn_Back');
          if (staySignedInButton) {
            await staySignedInButton.click(); // "No" button
            await delay(2000);
          }
        } catch (e) {
          console.log('No "Stay signed in" prompt or already handled');
        }
        
        // Wait for inbox to load
        console.log('Waiting for inbox to load');
        await page.waitForSelector('div[role="main"]', { timeout: 30000 });
        console.log('Inbox loaded successfully');
        
        // Get all email elements
        console.log('Fetching email list');
        const emailElements = await page.$$('div[role="option"]');
        console.log(`Found ${emailElements.length} emails`);
        
        // Extract details from each email (up to 10)
        const maxEmails = Math.min(10, emailElements.length);
        
        if (maxEmails > 0) {
          for (let i = 0; i < maxEmails; i++) {
            console.log(`Processing email ${i+1}/${maxEmails}`);
            
            try {
              // Click on the email to open it
              await emailElements[i].click();
              await delay(2000);
              
              // Extract email details
              const senderElement = await page.$('span[aria-label*="From"]');
              const subjectElement = await page.$('div[role="heading"]');
              
              let sender = 'Unknown Sender';
              let subject = 'No Subject';
              let content = '';
              
              if (senderElement) {
                sender = await page.evaluate(el => el.textContent || 'Unknown Sender', senderElement);
              }
              
              if (subjectElement) {
                subject = await page.evaluate(el => el.textContent || 'No Subject', subjectElement);
              }
              
              // Get email content
              const contentElements = await page.$$('div[role="main"] p');
              let contentText = '';
              
              for (const element of contentElements) {
                const text = await page.evaluate(el => el.textContent || '', element);
                if (text) contentText += text + ' ';
              }
              
              content = contentText || 'No content available';
              
              // Create a preview from the content
              const preview = content.substring(0, 100).trim();
              
              emails.push({
                sender,
                subject,
                content,
                preview
              });
              
              // Go back to inbox
              const backButton = await page.$('button[aria-label="Back"]');
              if (backButton) {
                await backButton.click();
                await delay(1000);
              }
            } catch (extractError) {
              console.error('Error extracting email details:', extractError);
            }
          }
        }
        
        // Log out
        console.log('Logging out');
        const accountManagerButton = await page.$('button[aria-label*="Account manager"]');
        if (accountManagerButton) {
          await accountManagerButton.click();
          await delay(1000);
          
          const signOutLink = await page.$('a[aria-label*="Sign out"]');
          if (signOutLink) {
            await signOutLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
          }
        }
        
      } catch (loginError: any) {
        console.error('Error during login or email fetching:', loginError);
      }
      
      // If no emails were found, provide a default one
      if (emails.length === 0) {
        emails.push({
          sender: "System Notification",
          subject: "No emails found",
          content: "Your inbox is empty or we encountered an issue loading emails.",
          preview: "Your inbox is empty or we encountered an issue loading emails."
        });
      }
      
      return emails;
      
    } catch (error: any) {
      console.error(`Email fetching error for ${email}:`, error);
      
      // Return a error notification email
      return [{
        sender: "System Error",
        subject: "Error fetching emails",
        content: `We encountered an error while trying to fetch your emails: ${error.message || 'Unknown error'}`,
        preview: "We encountered an error while trying to fetch your emails."
      }];
      
    } finally {
      // Always close the browser
      if (browser) {
        await browser.close();
        console.log('Browser closed');
      }
    }
  }
};

/**
 * Perform random activities in the inbox to maintain account
 */
async function performRandomInboxActivities(page: Page): Promise<void> {
  console.log('Performing random inbox activities');
  
  try {
    // 1. Click on some emails if available
    const emails = await page.$$('div[role="option"]');
    if (emails.length > 0) {
      console.log(`Found ${emails.length} emails, will interact with up to 3`);
      // Click on up to 3 emails
      for (let i = 0; i < Math.min(3, emails.length); i++) {
        await emails[i].click();
        await delay(2000);
        
        // Go back to inbox
        const backButton = await page.$('button[aria-label="Back"]');
        if (backButton) {
          await backButton.click();
          await delay(1000);
        }
      }
    } else {
      console.log('No emails found to interact with');
    }
    
    // 2. Search for something
    console.log('Performing search operation');
    const searchBox = await page.$('input[aria-label*="Search"]');
    if (searchBox) {
      await searchBox.click();
      await page.type('input[aria-label*="Search"]', 'newsletter');
      await page.keyboard.press('Enter');
      await delay(3000);
      
      // 3. Clear search
      const clearSearch = await page.$('button[aria-label*="Clear search"]');
      if (clearSearch) {
        await clearSearch.click();
        await delay(2000);
      }
    }
    
    // 4. Check folders if available
    console.log('Checking folders');
    const folders = await page.$$('div[role="treeitem"]');
    if (folders.length > 0) {
      // Click on a random folder
      const randomFolderIndex = Math.floor(Math.random() * folders.length);
      await folders[randomFolderIndex].click();
      await delay(2000);
      
      // Go back to inbox
      const inboxFolder = await page.$('div[title="Inbox"]');
      if (inboxFolder) {
        await inboxFolder.click();
        await delay(2000);
      }
    } else {
      console.log('No folders found to interact with');
    }
    
    console.log('Completed inbox activities');
  } catch (error) {
    console.error('Error performing inbox activities:', error);
  }
}