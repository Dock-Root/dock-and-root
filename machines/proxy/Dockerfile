FROM ubuntu:22.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    python3 python3-pip sudo vim curl \
    && rm -rf /var/lib/apt/lists/*
RUN pip3 install flask requests

# Add unprivileged user
RUN useradd -m www-data -s /bin/bash || true

# Set up the web app
WORKDIR /app
COPY src/ /app/

# Privilege Escalation: Sudo apt-get
RUN echo "www-data ALL=(root) NOPASSWD: /usr/bin/apt-get" > /etc/sudoers.d/www-data

# Set up the flags
RUN echo "HTB{ssrf_internal_bypass_rce}" > /home/www-data/user.txt
RUN echo "HTB{apt_get_sudo_privesc}" > /root/root.txt
RUN chmod 600 /root/root.txt
RUN chown -R www-data:www-data /home/www-data

# Script to start both servers
RUN echo '#!/bin/bash\npython3 /app/internal.py &\nexec sudo -u www-data python3 /app/proxy.py' > /start.sh && chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
