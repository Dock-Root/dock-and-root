FROM ubuntu:22.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    python3 python3-pip sudo iputils-ping vim gcc \
    && rm -rf /var/lib/apt/lists/*
RUN pip3 install flask gunicorn

# Add unprivileged user
RUN useradd -m www-data -s /bin/bash || true

# Set up the web app
WORKDIR /app
COPY src/ /app/

# Set up the jail
RUN mkdir -p /jail
# Copy necessary binaries and libraries to the jail
RUN cp -a /lib /lib64 /usr /bin /sbin /etc /jail/

# Make the sudoers rule allowing www-data to drop into the chroot jail as root, mapped to a fake shell
RUN echo "www-data ALL=(root) NOPASSWD: /usr/sbin/chroot /jail /bin/bash" > /etc/sudoers.d/www-data

# Set up the flags
RUN echo "HTB{web_cmd_injection_completed}" > /home/www-data/user.txt
RUN echo "HTB{chroot_escape_is_fun_129381}" > /jail/root/root.txt
RUN echo "HTB{chroot_escape_is_fun_129381}" > /root/root.txt
RUN chmod 600 /root/root.txt /jail/root/root.txt
RUN chown -R www-data:www-data /home/www-data

# Give the web wrapper a script
RUN echo '#!/bin/bash\ncd /app && gunicorn -b 0.0.0.0:80 app:app' > /start.sh && chmod +x /start.sh

EXPOSE 80
CMD ["sudo", "-u", "www-data", "/start.sh"]
