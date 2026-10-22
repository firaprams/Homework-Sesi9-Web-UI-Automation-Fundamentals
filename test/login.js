
const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Login Test', function () {
    this.timeout(30000);

    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
    });

    it('Seharusnya berhasil masuk dengan kredensial yang valid', async function () {
        // Membuka website
        await driver.get('https://belajar-bareng.onrender.com/');

        // Cari field username dan password pada form login
        const username = await driver.findElement(
            By.css('input[data-testid="username-input"]')
        );

        const password = await driver.findElement(
            By.css('input[data-testid="password-input"]')
        );

        // Isi username dan password sesuai kredensial
        await username.sendKeys('admin');
        await password.sendKeys('admin');

        // Cari form login sebelum tombol diklik
        const loginForm = await driver.findElement(By.css('form'));

        // Mengklik tombol Sign in
        const loginButton = await driver.findElement(
            By.css('button[data-testid="login-button"]')
        );

        await loginButton.click();

        // Tunggu sampai form login lama hilang
        await driver.wait(
            until.stalenessOf(loginForm),
            10000
        );

        // Memvalidasi hasil dengan assertion
        const usernameFields = await driver.findElements(
            By.css('input[data-testid="username-input"]')
        );

        expect(usernameFields).to.have.lengthOf(0);

        console.log('Login berhasil!');
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });
});
