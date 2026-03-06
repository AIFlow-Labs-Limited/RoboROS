FROM ros:jazzy-ros-base

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ros-jazzy-example-interfaces \
    ros-jazzy-rosbridge-suite \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/roboros

COPY launch-demo.sh /opt/roboros/launch-demo.sh
COPY robotflow_demo_node.py /opt/roboros/robotflow_demo_node.py

RUN chmod +x /opt/roboros/launch-demo.sh /opt/roboros/robotflow_demo_node.py

ENTRYPOINT ["/opt/roboros/launch-demo.sh"]
