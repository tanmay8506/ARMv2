const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://pykxpfyfvgkggcdvqyfd.supabase.co",
  "sb_publishable_8sXEqO3sP7n78YzzzQQNPg_6bABVHmA"
);

async function testSettings() {
  console.log("Fetching settings...");
  const { data, error } = await supabase
    .from("settings")
    .select("working_hours_start, working_hours_end")
    .single();

  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Settings Data:", data);
  }
}

testSettings();
