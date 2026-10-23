import { useSelector } from "react-redux";

const Profile = () => {
  const { user, rider } = useSelector((s) => s.riderAuth);

  if (!user || !rider) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
        👤 My Profile
      </h1>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{user.name}</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
          {user.email}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
          📞 {rider.phone}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 4 }}>🚚</div>
          <strong style={{ fontSize: 22 }}>{rider.totalDeliveries}</strong>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
            Total Deliveries
          </p>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 4 }}>💰</div>
          <strong style={{ fontSize: 22 }}>₹{rider.totalEarnings}</strong>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Earnings</p>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 4 }}>⭐</div>
          <strong style={{ fontSize: 22 }}>{rider.rating.toFixed(1)}</strong>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Rating</p>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 4 }}>🏍️</div>
          <strong style={{ fontSize: 14 }}>{rider.vehicleType}</strong>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
            {rider.vehicleNumber || "No plate set"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
