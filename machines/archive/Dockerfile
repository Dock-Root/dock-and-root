FROM ubuntu:22.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    apache2 php libapache2-mod-php cron vim sudo \
    && rm -rf /var/lib/apt/lists/*

# Add unprivileged user
RUN useradd -m www-data || true

# Set up the web app
WORKDIR /var/www/html
RUN rm index.html
COPY src/ /var/www/html/
RUN mkdir -p /var/www/html/uploads && chown www-data:www-data /var/www/html/uploads

# Privilege Escalation: Cronjob running a world-writable script
RUN echo "* * * * * root /usr/local/bin/cleanup.sh" > /etc/cron.d/cleanup_cron
RUN chmod 0644 /etc/cron.d/cleanup_cron

# Create the vulnerable cleanup script
RUN echo "#!/bin/bash\nrm -rf /var/www/html/uploads/*" > /usr/local/bin/cleanup.sh
# Make it world writable so anyone can inject into it!
RUN chmod 777 /usr/local/bin/cleanup.sh

# Set up the flags
RUN echo "HTB{unrestricted_file_upload_rce}" > /home/www-data/user.txt
RUN echo "HTB{cronjobs_are_dangerous}" > /root/root.txt
RUN chmod 600 /root/root.txt
RUN chown -R www-data:www-data /home/www-data

# Ensure Apache and Cron run
RUN echo '#!/bin/bash\nsource /etc/apache2/envvars\nservice cron start\nexec apache2 -D FOREGROUND' > /start.sh && chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
