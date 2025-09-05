import React from "react";
import Layout from "../../components/shared/Layout/Layout";
import { useSelector } from "react-redux";

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <Layout>
      <div className="container p-3">
        <div className="d-felx flex-column mt-4">
          <h1>
            Welcome Admin <i className="text-success">{user?.name}</i>
          </h1>
          <h3 className="mt-4">Manage Blood Bank App </h3>
          <hr />
          <p>
          You are at the heart of a life-saving mission. As the administrator of the Blood Bank App, your decisions directly impact lives. This powerful dashboard equips you with full control over critical operations—from managing blood inventory to regulating donors, hospitals, and organizations.

          You have the authority to approve or block donation camps, ensuring that every event is safe, efficient, and impactful. You can review emergency blood requests in real-time, assess their urgency, and take decisive action—even blocking misuse when necessary. With access to comprehensive history logs of donation camps and organizational activities, transparency and accountability are always at your fingertips.

          But this is more than just data management—this is leadership in action. You are the gatekeeper of trust, the enabler of hope, and the invisible force behind countless lives saved. With great power comes great responsibility—and you’re here not just to manage a system, but to uphold a mission.

          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;