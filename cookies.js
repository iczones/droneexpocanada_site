class CookieConsent extends HTMLElement
{
    connectedCallback()
    {
        this.render();
        this.setupEventListeners();
        this.checkConsent();
    }

    render()
    {
        const template = document.createElement("template");
        template.innerHTML = `
            <style>
                #cookie-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 20px;
                    border-top: 1px solid var(--dfq-red);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    z-index: 1000;
                }

                #cookie-banner.hidden {
                    display: none;
                }

                #cookie-text {
                    flex: 1;
                }

                #cookie-buttons {
                    display: flex;
                    gap: 10px;
                }

                button {
                    padding: 10px 20px;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                }

                #cookie-allow {
                    background: var(--dfq-red-l5);
                    color: var(--dfq-red-l1);
                }

                #cookie-refuse {
                    color: var(--dfq-red);
                    background: transparent;
                }
                
                @media (max-width: 768px) {
                    #cookie-banner{
                        flex-direction: column;
                    }
                }
            </style>

            <div id="cookie-banner">
                <div id="cookie-text">
                    <p lang="fr">Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic du site. En cliquant sur « Accepter tout », vous consentez à l'utilisation de ces cookies.</p>
                    <p lang="en">We use cookies to enhance your experience and analyze site traffic. By clicking "Allow all," you consent to the use of those cookies.</p>
                </div>
                <div id="cookie-buttons">
                    <button id="cookie-refuse"><span lang="en">Refuse</span><span lang="fr">Refuser</span></button>
                    <button id="cookie-allow"><span lang="en">Allow all</span><span lang="fr">Accepter tout</span></button>
                </div>
            </div>
        `;

        this.appendChild(template.content.cloneNode(true));
    }

    setupEventListeners()
    {
        const allowBtn = this.querySelector("#cookie-allow");
        const refuseBtn = this.querySelector("#cookie-refuse");

        allowBtn.addEventListener("click", () => this.handleAllow());
        refuseBtn.addEventListener("click", () => this.handleRefuse());

        // Listen for custom event to reopen banner
        document.addEventListener("reopenCookieConsent", () => this.reopen());
    }

    checkConsent()
    {
        const consent = localStorage.getItem("cookieConsent");
        if(consent) {
            this.hideBanner();
        }
    }

    handleAllow()
    {
        localStorage.setItem("cookieConsent", "allowed");
        this.loadScripts();
        this.hideBanner();
    }

    handleRefuse()
    {
        localStorage.setItem("cookieConsent", "refused");
        this.hideBanner();
    }

    hideBanner()
    {
        const banner = this.querySelector("#cookie-banner");
        banner.classList.add("hidden");
    }

    reopen()
    {
        localStorage.removeItem("cookieConsent");
        const banner = this.querySelector("#cookie-banner");
        banner.classList.remove("hidden");
    }

    loadScripts()
    {
        // Google Analytics
        const gaId = this.getAttribute("ga-id");
        if(gaId) {
            const gaScript = document.createElement("script");
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            document.head.appendChild(gaScript);

            window.dataLayer = window.dataLayer || [];

            function gtag()
            {
                window.dataLayer.push(arguments);
            }

            gtag("js", new Date());
            gtag("config", gaId);
        }

        // Meta Pixel
        const pixelId = this.getAttribute("pixel-id");
        if(pixelId) {
            const pixelScript = document.createElement("script");
            pixelScript.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(pixelScript);
        }
    }
}

customElements.define("cookie-consent", CookieConsent);
