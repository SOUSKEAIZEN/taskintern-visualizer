import * as fs from 'fs';
import * as pg from 'pg';
import * as url from 'url';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "28143"),
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIERDCCAqygAwIBAgIULc9rRvgmwh1eq4b0dMVntL2E7zMwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvYmQ2Y2MzNWItYWQyZi00MWIyLTkzMDgtYTJjNmYzOTM2
NDg2IFByb2plY3QgQ0EwHhcNMjYwMzA3MTUwNDEzWhcNMzYwMzA0MTUwNDEzWjA6
MTgwNgYDVQQDDC9iZDZjYzM1Yi1hZDJmLTQxYjItOTMwOC1hMmM2ZjM5MzY0ODYg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAJW9/6rX
4KQCoYsaPHeeiipAp9Jz5lsMs9mMvpO4aYQds74Wwjapc0Yf4lrAI1dbI0zdeMwR
HUfrinzOZmafev+kJBOpduS1erdWCoGKHKukFtwB+3MDtoj6V5rLVwcHjXpsT21d
P79ffFF4vXSat9fhk+kglFe9B+7bhBggJ9QSK33UO4TNRz9HyhdY84bRoTGJ4HNs
YA9kfFXWYN7grAeJKouRmy5v4PhjqgYQ42M38ZM7FbyUQg57AWuZ1D2fMy90CFx+
rJeVPvVRx4HC94GCUl6kFmJ7HYnvZiOjFBJkVc2hjCTKG2GVfChxR4pyPd9F+fML
QZzjBMLewCO4tkJjegCoKTvTj75G+SQ9/ML3xMcIq6uWEGzufaDQQnhbBpTPoHWi
t0tG6OuTROBv56gI30ySeo3rke2pmjTtNRxbO0OGX4v7lnGWj8AZrjREDoYLd+e2
mETq9tYuwO3Y8uo3GGNdj0VOSNlZHx4CMrWPQxlqW3+go2zM8qJ+jJUuQQIDAQAB
o0IwQDAdBgNVHQ4EFgQUlTnvdTctxDSNiD3FAzSTM1bdEAgwEgYDVR0TAQH/BAgw
BgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAFAbB6DCW4Zh
/Llh7alWRHKPnnOX6JtnJr1sC5VKqe5skzWgVRCBaHF1RG1V/6uXfnkTUTC7lLMg
z3Z7ktQZ2m7kixmVFGErrpoSfDy2q0L8bzE3OQtZf+6OIFtEx+cRor84OJFY5+Nj
FSyfSMrUm/1mJ9id7C7tvXxVngFZEN94URnF0dUia3omi74byzGvMeJbn9gyYQ6G
MuBfDYQngZmE7RkSfkKKcLNqA1nAfDltR/bHv/8Kxprbk8fURXS4UZtpqfYZmgLV
H2n8NOjWmQ8MZqcp1oFAtiZ40pZAdd8+fyaaVnA6Fx5Bscj4REWEYcg6ea9aMmw4
qAAwZfbJqbyM+RdBQ65mfKw4Jil6fglelsdhmCaHtq5iEBo5g+SisUsPcEsjqRAA
zv0FwRStQ5PaZ+LDNudW5QrCep1wC4SdKDAoVuLQXT0YmNuuWtWKGMGoJKXvNUO9
2U/VfLQmNCKt6M6pPyq+jPrX3EDJZ++cm7duqVF0NJxfZbRr7pKDbA==
-----END CERTIFICATE-----`,
    },
};

const client = new pg.Client(config);
client.connect(function (err: Error) {
    if (err)
        throw err;
    client.query("SELECT VERSION()", [], function (err: Error, result: any) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
        client.end(function (err: Error) {
            if (err)
                throw err;
        });
    });
});
