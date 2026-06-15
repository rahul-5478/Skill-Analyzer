import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dns.resolveSrv(
  "_mongodb._tcp.cluster0.jpttrqn.mongodb.net",
  (err, records) => {
    if (err) {
      console.error("ERROR:", err);
    } else {
      console.log("SUCCESS:", records);
    }
  }
);