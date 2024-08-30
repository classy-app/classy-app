// @refresh reload
import { StartServer, createHandler } from '@solidjs/start/server'

export default createHandler(() => (
    <StartServer
        document={({ assets, children, scripts }) => (
            <html lang="en" class="mdui-theme-auto">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    {/* TODO: Add a logo */}
                    {/* <link rel="icon" href="/favicon.ico" /> */}
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
                        rel="stylesheet"
                    />
                    <style>
                        {`
                        html {
                            background: #181818;
                            transition: background 0.25s;
                        }

                        @media (prefers-color-scheme: light) {
                            html {
                                background: #eeeeee;
                            }
                        }

                        body {
                            transition: opacity 0.25s;
                        }

                        body.loading {
                            opacity: 0;
                        }
                        `}
                    </style>
                    {assets}
                </head>
                <body class="loading">
                    {children}
                    {scripts}
                </body>
            </html>
        )}
    />
))
