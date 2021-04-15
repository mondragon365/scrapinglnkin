let btnstrap = document.getElementById('btnstrap')

btnstrap.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    chrome.scripting.executeScript({
        target: { tabId: tab.id},
        function: scrapingProfile,
    })
})

function scrapingProfile() {

    const cssSelectorsProfile = {
        profile: {
            name: 'div.ph5 > div.mt2 > div > ul > li',
            resumen: 'div.ph5 > div.mt2 > div > ul ~ h2',
            // country: 'div.ph5.pb5 > div.display-flex.mt2.pv-top-card--reflow > div.pv-top-card__list-container > ul.cx.mt1 > li'
            country: 'div.ph5 > div.mt2 > div > ul.mt1 > li.t-16',
            email: 'div > section.pv-contact-info__contact-type.ci-email > div > a',
            phone: 'div > section.pv-contact-info__contact-type.ci-phone > ul > li > span',
            urlLinkedin: 'div > section.pv-contact-info__contact-type.ci-vanity-url > div > a'
        },
        option: {
            buttonSeeMore: '[data-control-name="contact_see_more"]',
            buttonCloseSeeMore: 'button.artdeco-modal__dismiss'
        }
    }

    const wait = (milliseconds) => {
        return new Promise(function(resolve){
            setTimeout(function(){
                resolve()
            }, milliseconds);
        })
    }

    const autoscrollToElement = async function(cssSelector){
        const exists = document.querySelector(cssSelector)

        while (exists){
            let maxScrollTop = document.body.clientHeight - window.innerHeight
            let elementScrollTop = document.querySelector(cssSelector).offsetHeight
            let currentScrollTop = window.scrollY

            if (maxScrollTop == currentScrollTop || elementScrollTop <= currentScrollTop)
                break

            await wait(32)

            let newScrollTop = Math.min(currentScrollTop + 20, maxScrollTop)

            window.scrollTo(0, newScrollTop)
        }

        console.log('Finish autoscroll to element %s', cssSelector)

        return new Promise(function(resolve){
            resolve()
        })
    }

    const getContactProfile = async () => {
        const {
            profile: {
                name: nameCss,
                resumen: resumenCss,
                country: countryCss,
                email: emailCss,
                phone: phoneCss,
                urlLinkedin: urlLinkedinCss
            },
            option: {
                buttonSeeMore: buttonSeeMoreCss,
                buttonCloseSeeMore: buttonCloseSeeMoreCss
            }
        } = cssSelectorsProfile

        const name = document.querySelector(nameCss)?.innerText
        const resumen = document.querySelector(resumenCss)?.innerText
        const country = document.querySelector(countryCss)?.innerText

        const buttonSeeMore = document.querySelector(buttonSeeMoreCss)
        buttonSeeMore.click()

        await wait(1000)

        const email = document.querySelector(emailCss)?.innerText
        const phone = document.querySelector(phoneCss)?.innerText
        let urlLinkedin = document.querySelector(urlLinkedinCss)?.innerText
        if (urlLinkedin)
            urlLinkedin = `https://${urlLinkedin}`

        const buttonCloseSeeMore = document.querySelector(buttonCloseSeeMoreCss)
        buttonCloseSeeMore.click()

        let exp = []
        let edc = []

        const exp_sec = document.querySelector("#experience-section ul")
        const edu_sec = document.querySelector("#education-section ul");

        let company, term, work, place = '';

        [...exp_sec.querySelectorAll("li section")].map(expItem => {
            if (expItem.querySelector("section ul")) {
                company = expItem.querySelector("h3 span").nextElementSibling?.innerText || "";
                [...expItem.querySelectorAll("li")].map(subExpItem => {
                    term = subExpItem.querySelectorAll("h4 span")[1]?.innerText || ""
                    work = subExpItem.querySelector("h3 span").nextElementSibling?.innerText || ""
                    place = subExpItem.querySelectorAll("h4.pv-entity__location span")[1]?.innerText || ""
                    exp.push({ company, term, work, place })
                })
            }
            else {
                company = expItem.querySelector("p.pv-entity__secondary-title")?.innerText || ""
                term = expItem.querySelectorAll("h4 span")[1]?.innerText || ""
                work = expItem.querySelector("h3")?.innerText || ""
                place = expItem.querySelectorAll("h4.pv-entity__location span")[1]?.innerText || ""
                exp.push({ company, term, work, place })
            }
        });

        [...edu_sec.querySelectorAll("li div.pv-entity__summary-info")].map(edcItem => {
            const school = edcItem.querySelector("h3")?.innerText || ""
            const term = edcItem.querySelectorAll("div p.pv-entity__dates span")[1]?.innerText || ""
            let degree = {
                "name": edcItem.querySelectorAll("div.pv-entity__degree-info p span")[1]?.innerText,
                "discipline": edcItem.querySelectorAll("div.pv-entity__degree-info p span")[3]?.innerText
            }
            edc.push({ school, term, degree })
        })

        return { name, resumen, country, email, phone, urlLinkedin,exp,edc }
    }

    const getProfile = async () => {
        await autoscrollToElement('body')
        const profile = await getContactProfile()
        console.log(profile)
    }

    getProfile()
}