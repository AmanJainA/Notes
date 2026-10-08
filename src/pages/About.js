import React from "react";
import VM from '../img/About/vision-mission.jpeg';
import Own from '../img/Build/Self.png';
// Same structure as the original project's About.js (site-section /
// site-section-heading / vision & mission / team block) - runs inside
// DashboardLayout so it gets the same dark .Main shell, Header and
// Footer as the Dashboard.
export default function About() {
  return (
    <div className="site-section" data-aos="fade">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-12" data-aos="fade-up">
            <div className="row mb-5">
              <div className="col-12">
                <h2 className="site-section-heading text-center d-block mx-auto text-center">
                  About Us
                </h2>
                <p className="">
                  Welcome to <strong className="text-white">Notes App</strong>,
                  a clean, database-driven platform built to help students learn
                  programming languages the practical way clear explanations,
                  real code examples, and one place to track your progress
                  across every language.
                </p>
                <p className="mb-0">
                  We believe learning to code shouldn't mean digging through a
                  hundred scattered files. Everything here lives in one
                  consistent, easy-to-navigate structure.
                </p>
              </div>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-md-5 mb-2" data-aos="fade-right">
              <img src={VM} alt="Vision Mission" className="img-fluid mb-3" />
            </div>
            <div className="col-md-7 ml-auto" data-aos="fade-left">
              <h3 className="text-white">Our Vision</h3>
              <p>
                To be the go-to companion for students learning C, C++, Java,
                PHP, HTML, CSS, JavaScript and Bootstrap a place where every
                topic is explained clearly enough to actually build something
                with it, not just pass an exam.
              </p>

              <h3 className="text-white mt-2">Our Mission</h3>
              <ul>
                <li>Keep every lesson clear, practical, and example-driven.</li>
                <li>Track your progress across languages, automatically.</li>
                <li>
                  Make new lessons and languages easy to add content lives in
                  a database, not scattered files.
                </li>
                <li>Keep it fast, simple, and free of clutter.</li>
              </ul>
            </div>
          </div>

          <div className="row site-section text-center">
            <div className="col-md-6 col-lg-6 col-xl-4"></div>
            <div className="col-md-6 col-lg-6 col-xl-4">
              <h2 className="mb-4">Built By</h2>
              <img src={Own} alt="Profile" className="img-fluid w-50 rounded-circle mb-4" />
              <h4 className="font-weight-light mb-1"><strong>Founder & Lead Developer:</strong> Aman Jain</h4>
              <p><strong>Email:</strong> <a href="mailto:amanjain033@gmail.com">amanjain033@gmail.com</a></p>
              <p className="mb-0">
                Built for students who want a single, well-organized place to
                learn to code and to explore what they can build themselves.
              </p>
            </div>
            <div className="col-md-6 col-lg-6 col-xl-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
