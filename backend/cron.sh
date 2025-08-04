#!/bin/bash
curl -X POST https://plant-saathi-backend.onrender.com/api/cron/reset-daily-usage \
  -H "x-cron-secret: ${CRON_SECRET}"
