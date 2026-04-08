FROM ubuntu:22.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl sudo vim less \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Add unprivileged user
RUN useradd -m support_user -s /bin/bash || true

# Set up the web app
WORKDIR /app
COPY src/ /app/
RUN npm install

# Privilege Escalation: allowed to use sudo less without password
RUN echo "support_user ALL=(root) NOPASSWD: /usr/bin/less" > /etc/sudoers.d/support_user

# Set up the flags
RUN echo "HTB{support_portal_compromised}" > /home/support_user/user.txt
RUN echo "HTB{sudo_less_is_more_privesc}" > /root/root.txt
RUN chmod 600 /root/root.txt
RUN chown -R support_user:support_user /home/support_user

EXPOSE 8080
CMD ["sudo", "-u", "support_user", "node", "server.js"]
