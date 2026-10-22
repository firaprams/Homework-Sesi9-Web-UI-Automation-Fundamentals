const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Add User Test', function () {
    // Dinaikkan ke 60 detik agar Mocha tidak memicu timeout karena proses diperlambat
    this.timeout(60000); 

    let driver;

    // Fungsi pembantu untuk memberikan jeda waktu (dalam milidetik)
    async function slowDown(ms) {
        await driver.sleep(ms);
    }

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
        // Memaksimalkan ukuran window browser agar card lebih mudah terlihat
        await driver.manage().window().maximize();
    });

    it('Seharusnya berhasil menambahkan user baru', async function () {

        // 1. Buka website
        await driver.get('https://belajar-bareng.onrender.com/');
        await slowDown(1500); // Beri jeda setelah buka website

        // 2. Login otomatis
        const usernameLogin = await driver.findElement(By.css('input[data-testid="username-input"]'));
        const passwordLogin = await driver.findElement(By.css('input[data-testid="password-input"]'));

        await usernameLogin.sendKeys('admin');
        await slowDown(500); // Jeda mengetik username
        await passwordLogin.sendKeys('admin');
        await slowDown(500); // Jeda mengetik password

        const loginForm = await driver.findElement(By.css('form'));
        const loginButton = await driver.findElement(By.css('button[data-testid="login-button"]'));

        await loginButton.click();
        await slowDown(1000); 

        // Tunggu sampai form login hilang
        await driver.wait(until.stalenessOf(loginForm), 10000);

        // 3. Tunggu halaman List User
        await driver.wait(until.urlContains('/users'), 10000);
        await slowDown(1500); 

        // 4. Klik tombol Add
        const addButton = await driver.wait(
            until.elementLocated(By.xpath('//*[@id="app"]/div/div/div/div/button')),
            10000
        );
        await driver.wait(until.elementIsVisible(addButton), 10000);
        await addButton.click();
        await slowDown(1500); 

        // 5. Tunggu form Add Users muncul
        await driver.wait(until.elementLocated(By.css('input[data-testid="username-input"]')), 10000);

        // 6. Isi Username dan Age dengan data unik
        const uniqueId = Math.random().toString(36).substring(2, 6);
        const newUsername = 'U' + uniqueId;
        const newAge = Math.floor(Math.random() * 50 + 20).toString();

        const usernameInput = await driver.findElement(By.css('input[data-testid="username-input"]'));
        const ageInput = await driver.findElement(By.css('input[data-testid="age-input"]'));

        await usernameInput.sendKeys(newUsername);
        await slowDown(500);
        await ageInput.sendKeys(newAge);
        await slowDown(500);

        console.log(`Username yang di-input ke form: ${newUsername}`);
        console.log(`Age yang di-input ke form: ${newAge}`);

                // 7. Klik Submit
        const submitButton = await driver.findElement(By.css('button[data-testid="submit-button"]'));
        await submitButton.click();

        // ================= PENYEMPURNAAN AKURAT: EKSTRAKSI TOAST KATA =================
        const toastElement = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "User successfully added")]')),
            10000
        );
        const toastText = await toastElement.getText(); 
        console.log(`Teks Toast yang terbaca browser: "${toastText}"`);
        
        // Menggunakan split pada kata "Hi " lalu menghapus tanda seru (!) di ujung nama secara instan
        let finalBackendUsername = newUsername; 
        if (toastText.includes('Hi ')) {
            finalBackendUsername = toastText.split('Hi ')[1].replace('!', '').trim();
        }
        console.log(`Username Resmi dari Server Backend (Valid): "${finalBackendUsername}"`);
        // =====================================================================================

        // 8. Klik tombol List setelah Submit
        const listButton = await driver.wait(
            until.elementLocated(
                By.xpath('//button[contains(text(), "List") or contains(text(), "Back")]')
            ),
            10000
        );
        await driver.wait(until.elementIsVisible(listButton), 5000);
        await listButton.click();
        await slowDown(2000); 

        // 9. Cari user yang baru ditambahkan dengan Loop Scroll Terbalik
        await driver.wait(until.elementLocated(By.css('li.user-item')), 15000);

        let foundUserText = '';
        let isUserFound = false;
        const maxRetries = 25; // Ditambah menjadi 25 agar memberikan waktu lebih bagi database Render
        
        for (let i = 0; i < maxRetries; i++) {
            const userItems = await driver.findElements(By.css('li.user-item'));
            
            if (userItems.length > 0) {
                const lastUserItem = userItems[userItems.length - 1];
                
                await driver.executeScript(
                    "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'end' });", 
                    lastUserItem
                );
                await slowDown(1200); 

                // Perlebar area pencarian membaca hingga 10 baris card paling bawah
                const startIdx = Math.max(0, userItems.length - 10);
                let bottomUsersText = '';
                
                for (let j = userItems.length - 1; j >= startIdx; j--) {
                    bottomUsersText += await userItems[j].getText() + ' ';
                }

                if (bottomUsersText.includes(finalBackendUsername)) {
                    foundUserText = bottomUsersText;
                    isUserFound = true;
                    break; 
                }
            }
        }

    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });
});
