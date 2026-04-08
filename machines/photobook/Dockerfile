FROM ubuntu:22.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    apache2 php libapache2-mod-php vim sudo \
    && rm -rf /var/lib/apt/lists/*

# Add unprivileged user
RUN useradd -m www-data || true

# Set up the web app
WORKDIR /var/www/html
RUN rm index.html
COPY src/ /var/www/html/

# Let www-data read the apache logs for LFI log poisoning
RUN mkdir -p /var/log/apache2 && \
    touch /var/log/apache2/access.log && \
    chmod 755 /var/log/apache2 && \
    chmod 644 /var/log/apache2/access.log

# Privilege Escalation: Set SUID on /bin/cp
RUN chmod u+s /bin/cp

# Set up the flags
RUN echo "HTB{lfi_log_poisoning_woo}" > /home/www-data/user.txt
RUN echo "HTB{suid_cp_for_the_win}" > /root/root.txt
RUN chmod 600 /root/root.txt
RUN chown -R www-data:www-data /home/www-data

# Ensure Apache can run in the foreground
RUN echo '#!/bin/bash\nchown root:adm /var/log/apache2/access.log\nchmod 644 /var/log/apache2/access.log\nsource /etc/apache2/envvars\nexec apache2 -D FOREGROUND' > /start.sh && chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
