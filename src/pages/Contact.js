import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

// Same layout as the original project's Contact.js (form + contact info
// side panel, dark form-control styling) - but instead of posting to an
// external PHP endpoint, it inserts straight into Supabase
// (notes.contact_messages), keeping everything in one backend.
export default function Contact() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusOk, setStatusOk] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fname || !formData.email || !formData.message) {
      setStatusOk(false);
      setStatusMsg("Please fill all required fields.");
      return;
    }

    setSending(true);
    setStatusMsg("");

    const { error } = await supabase.from("contact_messages").insert({
      user_id: user?.id || null,
      name: `${formData.fname} ${formData.lname}`.trim(),
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    setSending(false);

    if (error) {
      setStatusOk(false);
      setStatusMsg("Failed to send message. Please try again later.");
      return;
    }

    setStatusOk(true);
    setStatusMsg("Message sent — thanks for reaching out!");
    setFormData({
      fname: "",
      lname: "",
      email: user?.email || "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="site-section" data-aos="fade">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7" data-aos="fade-up">
            <div className="row mb-5">
              <div className="col-12">
                <h2 className="site-section-heading text-center d-block mx-auto">
                  Contact
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="row" data-aos="fade-up">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit}>
              <div className="row mb-2">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="text-white" htmlFor="fname">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="fname"
                    name="fname"
                    className="form-control"
                    value={formData.fname}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="text-white" htmlFor="lname">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lname"
                    name="lname"
                    className="form-control"
                    value={formData.lname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-md-12">
                  <label className="text-white" htmlFor="email">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-md-12">
                  <label className="text-white" htmlFor="subject">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="form-control"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="text-white" htmlFor="message">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    cols="30"
                    rows="7"
                    className="form-control"
                    placeholder="Write your question or feedback here..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <button
                    type="submit"
                    disabled={sending}
                    className="btn btn-success py-2 px-4"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>

              {statusMsg && (
                <p
                  className={`mt-3 ${statusOk ? "text-success" : "text-danger"}`}
                >
                  {statusMsg}
                </p>
              )}
            </form>
          </div>

          <div className="col-lg-3 ml-auto mt-5" data-aos="fade-left">
            <div className="mb-3">
              <p className="mb-0 font-weight-bold text-white">Address</p>
              <p className="mb-4">
                Parasnath Colony, Baral Road, Bijainagar [Ajmer]
              </p>

              <p className="mb-0 font-weight-bold text-white">Phone</p>
              <p className="mb-4">
                <a href="tel:+918290367908" style={{ color: "#20c997" }}>
                  +91 8290367908
                </a>
              </p>
              <p className="mb-0 font-weight-bold text-white">Email</p>
              <p className="mb-4">
                <a
                  href="mailto:amanjain033@gmail.com"
                  style={{ color: "#20c997" }}
                >
                  amanjain033@gmail.com
                </a>
              </p>

              <p className="mb-0 font-weight-bold text-white">Response time</p>
              <p className="mb-0">We usually reply within 1–2 business days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
