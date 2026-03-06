#!/usr/bin/env python3
from __future__ import annotations

import base64
from datetime import datetime, timezone
from typing import Optional

import rclpy
from example_interfaces.srv import AddTwoInts
from geometry_msgs.msg import Twist
from rclpy.node import Node
from sensor_msgs.msg import CompressedImage
from std_msgs.msg import String

DEMO_FRAME_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7ZJ7sAAAAASUVORK5CYII="
)


class RobotFlowDemoNode(Node):
    def __init__(self) -> None:
        super().__init__("robotflow_demo_node")

        self._heartbeat_publisher = self.create_publisher(
            String, "/robotflow/demo/heartbeat", 10
        )
        self._camera_publisher = self.create_publisher(
            CompressedImage, "/robotflow/demo/camera/image_raw/compressed", 10
        )
        self._cmd_echo_publisher = self.create_publisher(
            Twist, "/robotflow/demo/cmd_vel_echo", 10
        )
        self._cmd_subscription = self.create_subscription(
            Twist, "/cmd_vel", self._on_cmd_vel, 10
        )
        self._add_two_ints_service = self.create_service(
            AddTwoInts, "/robotflow/demo/add_two_ints", self._on_add_two_ints
        )

        self._last_cmd: Optional[Twist] = None
        self._last_cmd_deadline_ns = 0

        self.create_timer(1.0, self._publish_heartbeat)
        self.create_timer(1.0, self._publish_camera_frame)
        self.create_timer(0.5, self._republish_last_cmd)

        self.get_logger().info("Robot Flow Labs demo topics and services are live.")

    def _publish_heartbeat(self) -> None:
        message = String()
        now = datetime.now(timezone.utc).isoformat()
        message.data = f"robotflow-demo heartbeat @ {now}"
        self._heartbeat_publisher.publish(message)

    def _publish_camera_frame(self) -> None:
        message = CompressedImage()
        message.header.stamp = self.get_clock().now().to_msg()
        message.format = "png"
        message.data = DEMO_FRAME_PNG
        self._camera_publisher.publish(message)

    def _on_cmd_vel(self, message: Twist) -> None:
        self._last_cmd = message
        self._last_cmd_deadline_ns = self.get_clock().now().nanoseconds + 5_000_000_000
        self._cmd_echo_publisher.publish(message)

    def _republish_last_cmd(self) -> None:
        if self._last_cmd is None:
            return
        if self.get_clock().now().nanoseconds > self._last_cmd_deadline_ns:
            self._last_cmd = None
            return
        self._cmd_echo_publisher.publish(self._last_cmd)

    def _on_add_two_ints(
        self, request: AddTwoInts.Request, response: AddTwoInts.Response
    ) -> AddTwoInts.Response:
        response.sum = request.a + request.b
        return response


def main() -> None:
    rclpy.init()
    node = RobotFlowDemoNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
