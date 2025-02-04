import supabaseClient, { supabaseUrl } from "@/utils/supabase";

export async function applyToJobs(token, _, jobData) {
  const supabase = await supabaseClient(token);
  const random = Math.floor(Math.random() * 90000);
  const fileName = `resume-${random}-${jobData.candidate_id}`;

  const { error: storageError } = await supabase.storage
    .from("resumes")
    .upload(fileName, jobData.resumes);

  if (storageError) {
    console.error("Error uploading resume:", storageError);
    return null;
  }

  const resume = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        ...jobData,
        resume,
      },
    ])
    .select();

  if (error) {
    console.log("Error Submitting Error:", error);
    return null;
  }

  return data;
}

export async function updateApplication(token, { job_id }, status) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("job_id", job_id)
    .select();

  if (error || data.length === 0) {
    console.error("Error Updating Status:", error);
    return null;
  }
  return data;
}

export async function getApplications(token, { user_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(title,company:companies(name))")
    .eq("candidate_id", user_id);

  if (error) {
    console.log("Error Fetching Applications:", error);
    return null;
  }

  return data;
}

export async function getMyJobs(token, { recruiter_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(name , logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.log("Error Fetching Jobs:", error);
    return null;
  }

  return data;
}

export async function deleteMyJobs(token, { job_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (error) {
    console.log("Error Deleting Jobs:", error);
    return null;
  }

  return data;
}
